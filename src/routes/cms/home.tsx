import { Hono } from "hono";
import { formatRupiah } from "@/domain/money";
import type { AppEnv } from "@/env";
import { CmsPage, html, loadCms } from "@/routes/cms/shared";
import { Actions, Badge, Card, CardTitle, DataList, QrImage, Text, TextLink } from "@/ui/display";
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
          <CardTitle>Langganan {dueBadge}</CardTitle>
          <DataList
            rows={[
              {
                label: "Paket",
                value: `${subscription?.plan === "pro" ? "Pro" : "Basic"} · ${formatRupiah(subscription?.monthly_price ?? 0)}/bulan`,
              },
              { label: "Jatuh tempo", value: subscription?.next_due_date ?? "belum aktif" },
            ]}
          />
        </Card>
        <Card>
          <CardTitle>Websitemu</CardTitle>
          <DataList
            rows={[
              {
                label: "Alamat",
                value: (
                  <TextLink href={`https://${tenant.slug}.${c.env.BASE_DOMAIN}`} external>
                    {tenant.slug}.{c.env.BASE_DOMAIN}
                  </TextLink>
                ),
              },
              ...(tenant.custom_domain
                ? [
                    {
                      label: "Domain sendiri",
                      value: (
                        <TextLink href={`https://${tenant.custom_domain}`} external>
                          {tenant.custom_domain}
                        </TextLink>
                      ),
                    },
                  ]
                : []),
            ]}
          />
          <Actions>
            <LinkButton href="/pratinjau" external>
              Pratinjau Website
            </LinkButton>
            <LinkButton href="/tema" variant="secondary">
              Ganti Tema
            </LinkButton>
            <LinkButton href="/statistik" variant="secondary">
              Lihat Statistik
            </LinkButton>
          </Actions>
        </Card>
        <Card>
          <CardTitle>Bagikan Website</CardTitle>
          <Text small muted>
            Tunjukkan QR ini di kasir, meja, atau brosur — pelanggan scan langsung buka websitemu.
            Screenshot untuk dicetak.
          </Text>
          <QrImage
            data={`https://${tenant.slug}.${c.env.BASE_DOMAIN}`}
            caption={`${tenant.slug}.${c.env.BASE_DOMAIN}`}
          />
        </Card>
      </CmsPage>,
    ),
  );
});
