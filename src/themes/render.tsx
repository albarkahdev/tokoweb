import type { PublicSite } from "@/db/public-site";
import { getThemeRenderer } from "@/themes/registry";
import { PageShell } from "@/ui/page-shell";
import { Section } from "@/ui/section";
import { Heading, Text } from "@/ui/typography";

export function renderPublicSiteHtml(site: PublicSite): string {
  const renderer = getThemeRenderer(site.themeSlug);
  const body = renderer({
    tenantName: site.name,
    content: site.content,
    tokens: site.tokens,
  });
  return `<!doctype html>${body}`;
}

export function renderSuspendedHtml(tenantName: string): string {
  const page = (
    <PageShell title={`${tenantName} — sementara nonaktif`}>
      <Section>
        <Heading level={1}>{tenantName}</Heading>
        <Text>Situs ini sementara nonaktif. Silakan kembali lagi nanti.</Text>
      </Section>
    </PageShell>
  );
  return `<!doctype html>${String(page)}`;
}
