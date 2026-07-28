import { PageShell } from "@/ui/page-shell";
import { Section } from "@/ui/section";
import { Heading, Text } from "@/ui/typography";

export { renderKulinerPage } from "@/themes/engine/render";

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
