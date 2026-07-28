import type { SiteContent } from "@/domain/content";
import { fallbackTheme } from "@/themes/fallback";

export type ThemeRenderContext = {
  tenantName: string;
  content: SiteContent;
  tokens: Record<string, unknown>;
};

export type ThemeRenderer = (ctx: ThemeRenderContext) => string;

const renderers = new Map<string, ThemeRenderer>();

export function registerTheme(slug: string, renderer: ThemeRenderer): void {
  renderers.set(slug, renderer);
}

export function getThemeRenderer(slug: string): ThemeRenderer {
  return renderers.get(slug) ?? fallbackTheme;
}
