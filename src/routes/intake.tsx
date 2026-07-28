import { type Context, Hono } from "hono";
import { peekToken } from "@/db/auth-tokens";
import { createIntake } from "@/db/intake";
import { storageFromEnv } from "@/db/storage-env";
import { findTenantById } from "@/db/tenants";
import { DAY_KEYS, DAY_LABELS, formDataToValues } from "@/domain/cms";
import { buildImageKey } from "@/domain/image-key";
import { generateOneTimeToken } from "@/domain/one-time-token";
import type { AppEnv } from "@/env";
import { AppLayout } from "@/ui/app-layout";
import { Card } from "@/ui/display";
import { Button, Field, TextAreaField } from "@/ui/form";

const MENU_ROWS = 8;
const MAX_PHOTOS = 6;
const MAX_UPLOAD_BYTES = 512_000;

function IntakePage(props: {
  token: string;
  businessName: string;
  notice?: string;
  error?: string;
}) {
  return (
    <AppLayout title={`Form Data Usaha — ${props.businessName}`}>
      <Card>
        <h1>Data Usaha: {props.businessName}</h1>
        <p class="small muted">
          Isi santai saja dari HP — nanti kami rapikan sebelum website tayang. Butuh ± 10 menit.
        </p>
        {props.notice ? <p class="alert success">{props.notice}</p> : null}
        {props.error ? <p class="alert danger">{props.error}</p> : null}
        <form
          method="post"
          action={`/intake/${props.token}`}
          enctype="multipart/form-data"
          data-webp-upload
        >
          <Field label="Nama usaha" name="name" required />
          <TextAreaField
            label="Ceritakan usahamu"
            name="about"
            hint="Sejak kapan? Apa yang spesial? Ditulis bebas."
          />
          <Field label="Alamat lengkap" name="address" required />
          <Field label="Link Google Maps (kalau ada)" name="maps_url" />
          <Field label="No WhatsApp untuk pembeli" name="wa_number" inputmode="tel" required />
          <Field label="Instagram (tanpa @)" name="instagram" />
          <Field
            label="Email kamu"
            name="email"
            type="email"
            required
            hint="Untuk login mengelola website"
          />
          <h3>Jam buka</h3>
          {DAY_KEYS.map((day) => (
            <div class="field">
              <span>{DAY_LABELS[day]}</span>
              <div class="row-actions">
                <input type="time" name={`${day}_open`} value="08:00" />
                <input type="time" name={`${day}_close`} value="21:00" />
                <label class="small">
                  <input type="checkbox" name={`${day}_closed`} /> Tutup
                </label>
              </div>
            </div>
          ))}
          <h3>Menu andalanmu</h3>
          <p class="small muted">Isi yang paling laku dulu. Bisa ditambah lagi nanti.</p>
          {Array.from({ length: MENU_ROWS }, (_, index) => (
            <div class="row-actions">
              <input type="text" name={`menu_name_${index}`} placeholder={`Menu ${index + 1}`} />
              <input
                type="text"
                name={`menu_price_${index}`}
                placeholder="Harga"
                inputmode="numeric"
              />
            </div>
          ))}
          <h3>Foto</h3>
          <label class="field">
            <span>Foto makanan / tempat (maks {MAX_PHOTOS})</span>
            <input type="file" name="photos" accept="image/*" multiple />
            <div class="hint">Foto terang dan jelas ya — otomatis dikompres.</div>
          </label>
          <Button block>Kirim</Button>
        </form>
        <script src="/assets/upload.js" defer />
      </Card>
    </AppLayout>
  );
}

async function resolveIntakeTenant(c: Context<AppEnv, "/intake/:token">) {
  const token = c.req.param("token") ?? "";
  const row = await peekToken(c.env.DB, token, "intake", Date.now());
  if (!row || row.tenant_id === null) return null;
  const tenant = await findTenantById(c.env.DB, row.tenant_id);
  return tenant ? { token, tenant } : null;
}

export const intake = new Hono<AppEnv>()
  .get("/intake/:token", async (c) => {
    const resolved = await resolveIntakeTenant(c);
    if (!resolved) {
      return c.html(
        `<!doctype html>${String(
          <AppLayout title="Link kadaluarsa — tokoweb">
            <Card>
              <h1>Link tidak berlaku</h1>
              <p>Link ini kadaluarsa atau salah. Hubungi kami via WhatsApp untuk link baru.</p>
            </Card>
          </AppLayout>,
        )}`,
        404,
      );
    }
    return c.html(
      `<!doctype html>${String(
        <IntakePage token={resolved.token} businessName={resolved.tenant.name} />,
      )}`,
    );
  })
  .post("/intake/:token", async (c) => {
    const resolved = await resolveIntakeTenant(c);
    if (!resolved) return c.notFound();
    const formData = await c.req.formData();
    const values = formDataToValues(formData);

    const name = (values.name ?? "").trim();
    const waNumber = (values.wa_number ?? "").replace(/\D/g, "");
    const email = (values.email ?? "").trim();
    if (!name || !waNumber || !email.includes("@")) {
      return c.html(
        `<!doctype html>${String(
          <IntakePage
            token={resolved.token}
            businessName={resolved.tenant.name}
            error="Nama usaha, no WA, dan email wajib diisi."
          />,
        )}`,
        400,
      );
    }

    const hours: Record<string, [string, string] | null> = {};
    for (const day of DAY_KEYS) {
      hours[day] =
        values[`${day}_closed`] === "on"
          ? null
          : [values[`${day}_open`] ?? "08:00", values[`${day}_close`] ?? "21:00"];
    }

    const menu: { name: string; price: number }[] = [];
    for (let index = 0; index < MENU_ROWS; index++) {
      const itemName = (values[`menu_name_${index}`] ?? "").trim();
      const price = Number((values[`menu_price_${index}`] ?? "").replace(/\D/g, ""));
      if (itemName && price > 0) menu.push({ name: itemName, price });
    }

    const storage = storageFromEnv(c.env);
    const gallery: { image_key: string; alt: string }[] = [];
    const photos = formData
      .getAll("photos")
      .filter((entry): entry is File => entry instanceof File);
    for (const photo of photos.slice(0, MAX_PHOTOS)) {
      if (photo.size === 0 || photo.type !== "image/webp" || photo.size > MAX_UPLOAD_BYTES)
        continue;
      const key = buildImageKey(
        resolved.tenant.slug,
        "gallery",
        `${generateOneTimeToken().slice(0, 12)}.webp`,
      );
      await storage.put(key, await photo.arrayBuffer(), "image/webp");
      gallery.push({ image_key: key, alt: name });
    }

    const raw = {
      info: {
        name,
        about: (values.about ?? "").trim(),
        address: (values.address ?? "").trim(),
        maps_url: (values.maps_url ?? "").trim(),
        wa_number: waNumber,
        instagram: (values.instagram ?? "").trim(),
      },
      owner_email: email,
      hours,
      menu: [{ category: "Menu", items: menu }],
      gallery,
    };
    await createIntake(c.env.DB, resolved.tenant.id, JSON.stringify(raw));

    return c.html(
      `<!doctype html>${String(
        <AppLayout title="Terkirim — tokoweb">
          <Card>
            <h1>Terkirim! 🎉</h1>
            <p>
              Data usahamu sudah kami terima. Kami rapikan dulu, lalu websitemu tayang — kami kabari
              via WhatsApp. Kalau ada yang mau ditambah, buka lagi link yang sama.
            </p>
          </Card>
        </AppLayout>,
      )}`,
    );
  });
