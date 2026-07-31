import { Hono } from "hono";
import { GUIDE_ADMIN } from "@/domain/guides";
import type { AppEnv } from "@/env";
import { AdminPage, adminHtml } from "@/routes/admin/shared";
import { GuideView } from "@/ui/guide";

export const adminBantuan = new Hono<AppEnv>().get("/bantuan", (c) =>
  c.html(
    adminHtml(
      <AdminPage title="Bantuan" currentPath="/admin/bantuan">
        <GuideView guide={GUIDE_ADMIN} />
      </AdminPage>,
    ),
  ),
);
