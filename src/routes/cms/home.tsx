import { Hono } from "hono";
import { formatRupiah } from "@/domain/money";
import type { AppEnv } from "@/env";
import { CmsPage, html, loadCms } from "@/routes/cms/shared";
import { Badge, Card } from "@/ui/display";
import { LinkButton } from "@/ui/form";

export const cmsHome = new Hono<AppEnv>().get("/", async (c) => {
  const cms = await loadCms(c);
  if (!cms) return c.redirect("/masuk");
  const { tenant, subscription } = cms;

  const dueBadge =
    tenant.status === "active" ? (
      <Badge tone="success">LUNAS ✓</Badge>
    ) : tenant.status === "grace" ? (
      <Badge tone="warning">Belum bayar ⚠</Badge>
    ) : (
      <Badge tone="danger">Nonaktif</Badge>
    );

  return c.html(
    html(
      <CmsPage title="Beranda" currentPath="/" cms={cms}>
        <Card>
          <h2>Langganan</h2>
          <p class="mb-0">
            Paket <strong>{subscription?.plan === "pro" ? "Pro" : "Basic"}</strong> ·{" "}
            {formatRupiah(subscription?.monthly_price ?? 0)}/bulan
            <br />
            Jatuh tempo: <strong>{subscription?.next_due_date ?? "belum aktif"}</strong> {dueBadge}
          </p>
        </Card>
        <Card>
          <h2>Websitemu</h2>
          <p>
            <a href={`https://${tenant.slug}.${c.env.BASE_DOMAIN}`} target="_blank" rel="noopener">
              {tenant.slug}.{c.env.BASE_DOMAIN}
            </a>
            {tenant.custom_domain ? (
              <>
                {" · "}
                <a href={`https://${tenant.custom_domain}`} target="_blank" rel="noopener">
                  {tenant.custom_domain}
                </a>
              </>
            ) : null}
          </p>
          <div class="row-actions">
            <LinkButton href="/tema" variant="secondary">
              Ganti Tema
            </LinkButton>
            <LinkButton href="/statistik" variant="secondary">
              Lihat Statistik
            </LinkButton>
          </div>
        </Card>
      </CmsPage>,
    ),
  );
});
