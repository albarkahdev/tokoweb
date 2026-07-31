import { type Context, Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { consumeToken } from "@/db/auth-tokens";
import {
  bumpSessionVersion,
  findOwnerByPhone,
  findUserByEmail,
  findUserById,
  updateUserPassword,
} from "@/db/users";
import { hashPassword, isAcceptablePassword, verifyPassword } from "@/domain/password";
import { createFixedWindowLimiter } from "@/domain/rate-limit";
import { isValidWaNumber, normalizeWaNumber, resetWaLink } from "@/domain/reset";
import { createSessionToken, SESSION_TTL_MS } from "@/domain/session";
import { verifyTurnstile } from "@/domain/turnstile";
import type { AppEnv } from "@/env";
import { SESSION_COOKIE } from "@/routes/middleware";
import { AppLayout, AuthBrand } from "@/ui/app-layout";
import { Alert, Card, PageTitle, Text, TextLink } from "@/ui/display";
import { Button, Field, Form, HiddenInput, LinkButton } from "@/ui/form";
import { TurnstileWidget } from "@/ui/turnstile-widget";

const resetLimiter = createFixedWindowLimiter(5, 3_600_000);

function LoginPage(props: { error?: string; siteKey?: string }) {
  return (
    <AppLayout title="Masuk — tokoweb" centered>
      <AuthBrand tagline="Kelola websitemu dari sini" />
      <Card>
        <PageTitle>Masuk</PageTitle>
        {props.error ? <Alert tone="danger">{props.error}</Alert> : null}
        <Form action="/masuk">
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required />
          <TurnstileWidget siteKey={props.siteKey} />
          <Button block>Masuk</Button>
        </Form>
        <Text small muted last>
          <TextLink href="/lupa">Lupa password?</TextLink>
        </Text>
      </Card>
    </AppLayout>
  );
}

function ForgotPage(props: { siteKey?: string; error?: string; waHref?: string; phone?: string }) {
  return (
    <AppLayout title="Lupa Password — tokoweb" centered>
      <AuthBrand tagline="Atur ulang password lewat WhatsApp" />
      <Card>
        <PageTitle>Lupa Password</PageTitle>
        {props.error ? <Alert tone="danger">{props.error}</Alert> : null}
        {props.waHref ? (
          <>
            <Text>
              Nomor <strong>{props.phone}</strong> terdaftar. Klik tombol di bawah untuk minta link
              atur ulang lewat WhatsApp — kami balas secepatnya.
            </Text>
            <LinkButton href={props.waHref} external>
              💬 Minta Reset via WhatsApp
            </LinkButton>
            <Text small muted last>
              <TextLink href="/masuk">← Kembali ke Masuk</TextLink>
            </Text>
          </>
        ) : (
          <>
            <Text small muted>
              Masukkan nomor WhatsApp yang kamu pakai saat daftar. Kalau terdaftar, muncul tombol
              untuk minta reset.
            </Text>
            <Form action="/lupa">
              <Field
                label="Nomor WhatsApp"
                name="wa_number"
                inputmode="numeric"
                required
                hint="Format 08xx atau 62xx"
              />
              <TurnstileWidget siteKey={props.siteKey} />
              <Button block>Lanjut</Button>
            </Form>
            <Text small muted last>
              <TextLink href="/masuk">← Kembali ke Masuk</TextLink>
            </Text>
          </>
        )}
      </Card>
    </AppLayout>
  );
}

function SetPasswordPage(props: { token: string; error?: string }) {
  return (
    <AppLayout title="Atur Password — tokoweb" centered>
      <AuthBrand tagline="Satu langkah lagi — buat password" />
      <Card>
        <PageTitle>Atur Password</PageTitle>
        {props.error ? <Alert tone="danger">{props.error}</Alert> : null}
        <Form action="/atur-sandi">
          <HiddenInput name="token" value={props.token} />
          <Field
            label="Password baru"
            name="password"
            type="password"
            required
            hint="Minimal 8 karakter"
          />
          <Button block>Simpan &amp; Masuk</Button>
        </Form>
      </Card>
    </AppLayout>
  );
}

export const auth = new Hono<AppEnv>()
  .get("/masuk", (c) => c.html(String(<LoginPage siteKey={c.env.TURNSTILE_SITE_KEY} />)))
  .post("/masuk", async (c) => {
    const form = await c.req.formData();
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const captcha = String(form.get("cf-turnstile-response") ?? "");
    const humanOk = await verifyTurnstile(
      c.env.TURNSTILE_SECRET,
      captcha,
      c.req.header("cf-connecting-ip"),
    );
    if (!humanOk) {
      return c.html(
        String(
          <LoginPage
            error="Verifikasi anti-robot gagal. Coba lagi."
            siteKey={c.env.TURNSTILE_SITE_KEY}
          />,
        ),
        400,
      );
    }
    const user = email ? await findUserByEmail(c.env.DB, email) : null;
    const valid = user ? await verifyPassword(password, user.password_hash) : false;
    if (!user || !valid) {
      return c.html(
        String(<LoginPage error="Email atau password salah." siteKey={c.env.TURNSTILE_SITE_KEY} />),
        401,
      );
    }
    await startSession(c, user.id, user.role, user.tenant_id, user.session_version);
    return c.redirect(user.role === "admin" ? "/admin" : "/");
  })
  .get("/lupa", (c) => c.html(String(<ForgotPage siteKey={c.env.TURNSTILE_SITE_KEY} />)))
  .post("/lupa", async (c) => {
    const ip = c.req.header("cf-connecting-ip") ?? "0.0.0.0";
    const form = await c.req.formData();
    const captcha = String(form.get("cf-turnstile-response") ?? "");
    const humanOk = await verifyTurnstile(c.env.TURNSTILE_SECRET, captcha, ip);
    if (!humanOk) {
      return c.html(
        String(
          <ForgotPage
            error="Verifikasi anti-robot gagal. Coba lagi."
            siteKey={c.env.TURNSTILE_SITE_KEY}
          />,
        ),
        400,
      );
    }
    if (!resetLimiter.allow(ip, Date.now())) {
      return c.html(
        String(
          <ForgotPage
            error="Terlalu banyak percobaan. Coba lagi nanti."
            siteKey={c.env.TURNSTILE_SITE_KEY}
          />,
        ),
        429,
      );
    }
    const raw = String(form.get("wa_number") ?? "");
    if (!isValidWaNumber(raw)) {
      return c.html(
        String(
          <ForgotPage error="Nomor WhatsApp tidak valid." siteKey={c.env.TURNSTILE_SITE_KEY} />,
        ),
        400,
      );
    }
    const phone = normalizeWaNumber(raw);
    const registered = await findOwnerByPhone(c.env.DB, phone);
    if (!registered || !c.env.CONTACT_WA_NUMBER) {
      return c.html(
        String(
          <ForgotPage
            error="Nomor tidak ditemukan. Pastikan sama dengan nomor saat daftar, atau hubungi admin."
            siteKey={c.env.TURNSTILE_SITE_KEY}
          />,
        ),
        404,
      );
    }
    return c.html(
      String(<ForgotPage phone={phone} waHref={resetWaLink(c.env.CONTACT_WA_NUMBER, phone)} />),
    );
  })
  .post("/keluar", async (c) => {
    const session = c.get("session");
    if (session) await bumpSessionVersion(c.env.DB, session.userId);
    deleteCookie(c, SESSION_COOKIE, { path: "/" });
    return c.redirect("/masuk");
  })
  .get("/atur-sandi", (c) => {
    const token = c.req.query("token") ?? "";
    if (!token) return c.notFound();
    return c.html(String(<SetPasswordPage token={token} />));
  })
  .post("/atur-sandi", async (c) => {
    const form = await c.req.formData();
    const token = String(form.get("token") ?? "");
    const password = String(form.get("password") ?? "");
    if (!isAcceptablePassword(password)) {
      return c.html(
        String(<SetPasswordPage token={token} error="Password minimal 8 karakter." />),
        400,
      );
    }
    const row = await consumeToken(c.env.DB, token, "set_password", Date.now());
    if (!row || row.user_id === null) {
      return c.html(
        String(
          <SetPasswordPage
            token=""
            error="Link tidak berlaku atau kadaluarsa. Minta link baru via WhatsApp."
          />,
        ),
        400,
      );
    }
    await updateUserPassword(c.env.DB, row.user_id, await hashPassword(password));
    const user = await findUserById(c.env.DB, row.user_id);
    if (!user) return c.redirect("/masuk");
    await startSession(c, user.id, user.role, user.tenant_id, user.session_version);
    return c.redirect(user.role === "admin" ? "/admin" : "/");
  });

async function startSession(
  c: Context<AppEnv>,
  userId: number,
  role: "admin" | "owner",
  tenantId: number | null,
  ver: number,
): Promise<void> {
  const token = await createSessionToken(
    { userId, role, tenantId, expiresAtMs: Date.now() + SESSION_TTL_MS, ver },
    c.env.AUTH_SECRET,
  );
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}
