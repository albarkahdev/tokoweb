import { Hono } from "hono";
import { GUIDE_OWNER } from "@/domain/guides";
import type { AppEnv } from "@/env";
import { CmsPage, html, loadCms } from "@/routes/cms/shared";
import { GuideView } from "@/ui/guide";

export const cmsBantuan = new Hono<AppEnv>().get("/bantuan", async (c) => {
  const cms = await loadCms(c);
  if (!cms) return c.redirect("/masuk");
  return c.html(
    html(
      <CmsPage title="Bantuan" currentPath="/bantuan" cms={cms}>
        <GuideView guide={GUIDE_OWNER} />
      </CmsPage>,
    ),
  );
});
