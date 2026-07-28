import { type Context, Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { consumeToken } from "@/db/auth-tokens";
import { findUserByEmail, findUserById, updateUserPassword } from "@/db/users";
import { hashPassword, isAcceptablePassword, verifyPassword } from "@/domain/password";
import { createSessionToken, SESSION_TTL_MS } from "@/domain/session";
import type { AppEnv } from "@/env";
import { SESSION_COOKIE } from "@/routes/middleware";
import { AppLayout } from "@/ui/app-layout";
import { Alert, Card } from "@/ui/display";
import { Button, Field } from "@/ui/form";

function LoginPage(props: { error?: string }) {
  return (
    <AppLayout title="Masuk — tokoweb">
      <Card>
        <h1>Masuk</h1>
        {props.error ? <Alert tone="danger">{props.error}</Alert> : null}
        <form method="post" action="/masuk">
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required />
          <Button block>Masuk</Button>
        </form>
        <p class="small muted">
          Lupa password? Hubungi kami via WhatsApp — kami kirim link atur ulang.
        </p>
      </Card>
    </AppLayout>
  );
}

function SetPasswordPage(props: { token: string; error?: string }) {
  return (
    <AppLayout title="Atur Password — tokoweb">
      <Card>
        <h1>Atur Password</h1>
        {props.error ? <Alert tone="danger">{props.error}</Alert> : null}
        <form method="post" action="/atur-sandi">
          <input type="hidden" name="token" value={props.token} />
          <Field
            label="Password baru"
            name="password"
            type="password"
            required
            hint="Minimal 8 karakter"
          />
          <Button block>Simpan &amp; Masuk</Button>
        </form>
      </Card>
    </AppLayout>
  );
}

export const auth = new Hono<AppEnv>()
  .get("/masuk", (c) => c.html(String(<LoginPage />)))
  .post("/masuk", async (c) => {
    const form = await c.req.formData();
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const user = email ? await findUserByEmail(c.env.DB, email) : null;
    const valid = user ? await verifyPassword(password, user.password_hash) : false;
    if (!user || !valid) {
      return c.html(String(<LoginPage error="Email atau password salah." />), 401);
    }
    await startSession(c, user.id, user.role, user.tenant_id);
    return c.redirect(user.role === "admin" ? "/admin" : "/");
  })
  .post("/keluar", (c) => {
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
    await startSession(c, user.id, user.role, user.tenant_id);
    return c.redirect(user.role === "admin" ? "/admin" : "/");
  });

async function startSession(
  c: Context<AppEnv>,
  userId: number,
  role: "admin" | "owner",
  tenantId: number | null,
): Promise<void> {
  const token = await createSessionToken(
    { userId, role, tenantId, expiresAtMs: Date.now() + SESSION_TTL_MS },
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
