import { describe, expect, it } from "vitest";
import { BLOG_ARTICLES, blogSlugs, findArticle, parseBlogBody } from "@/domain/blog";

describe("blog", () => {
  it("punya 10 artikel dengan slug unik", () => {
    expect(BLOG_ARTICLES).toHaveLength(10);
    expect(new Set(blogSlugs()).size).toBe(10);
  });

  it("setiap artikel lengkap + CTA gabung", () => {
    for (const article of BLOG_ARTICLES) {
      expect(article.title.length).toBeGreaterThan(10);
      expect(article.description.length).toBeGreaterThan(20);
      expect(article.keywords.length).toBeGreaterThan(0);
      expect(article.body).toContain("tokoweb.id");
    }
  });

  it("findArticle menemukan & mengabaikan yang tak ada", () => {
    expect(findArticle("cara-bikin-website-warung-makan")?.slug).toBe(
      "cara-bikin-website-warung-makan",
    );
    expect(findArticle("tidak-ada")).toBeUndefined();
  });

  it("parseBlogBody memisah heading, list, paragraf", () => {
    const blocks = parseBlogBody("## Judul\nParagraf satu.\n- Poin a\n- Poin b\n\nParagraf dua.");
    expect(blocks).toEqual([
      { type: "h2", text: "Judul" },
      { type: "p", text: "Paragraf satu." },
      { type: "li", text: "Poin a" },
      { type: "li", text: "Poin b" },
      { type: "p", text: "Paragraf dua." },
    ]);
  });
});
