import { Hono } from "hono";
import { billingWaLink } from "@/domain/billing";
import { GUIDE_OWNER } from "@/domain/guides";
import type { AppEnv } from "@/env";
import { CmsPage, html, loadCms } from "@/routes/cms/shared";
import { Card, CardTitle, Text } from "@/ui/display";
import { LinkButton } from "@/ui/form";
import { GuideView } from "@/ui/guide";

export const cmsBantuan = new Hono<AppEnv>().get("/bantuan", async (c) => {
  const cms = await loadCms(c);
  if (!cms) return c.redirect("/masuk");
  const adminNumber = c.env.PHONE_NUMBER_ADMIN;
  const waLink = billingWaLink(
    adminNumber,
    `Halo TokoWeb, saya ${cms.tenant.name} (${cms.tenant.slug}.${c.env.BASE_DOMAIN}). Saya mau tanya soal: `,
  );
  return c.html(
    html(
      <CmsPage title="Bantuan" currentPath="/bantuan" cms={cms}>
        {adminNumber ? (
          <Card>
            <CardTitle>Masih bingung? Chat admin</CardTitle>
            <Text muted>
              Ada kendala atau pertanyaan yang tidak terjawab di panduan? Chat langsung — kami balas
              di jam kerja.
            </Text>
            <LinkButton href={waLink} external>
              💬 Chat Admin via WhatsApp
            </LinkButton>
          </Card>
        ) : null}
        <GuideView guide={GUIDE_OWNER} />
      </CmsPage>,
    ),
  );
});
