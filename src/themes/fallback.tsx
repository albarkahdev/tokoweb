import type { SiteContent } from "@/domain/content";
import { CtaLink } from "@/ui/cta-link";
import { PageShell } from "@/ui/page-shell";
import { Section } from "@/ui/section";
import { Heading, Text } from "@/ui/typography";

type FallbackProps = {
  tenantName: string;
  content: SiteContent;
  tokens: Record<string, unknown>;
};

export function fallbackTheme(ctx: FallbackProps): string {
  const info = ctx.content.info ?? {};
  const title = info.name ?? ctx.tenantName;
  const page = (
    <PageShell title={title} description={info.tagline}>
      <Section id="info">
        <Heading level={1}>{title}</Heading>
        {info.tagline ? <Text>{info.tagline}</Text> : null}
        {info.about ? <Text>{info.about}</Text> : null}
        {info.address ? <Text>{info.address}</Text> : null}
        {info.wa_number ? (
          <CtaLink href={`https://wa.me/${info.wa_number}`}>Hubungi via WhatsApp</CtaLink>
        ) : null}
      </Section>
    </PageShell>
  );
  return String(page);
}
