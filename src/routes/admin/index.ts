import { Hono } from "hono";
import type { AppEnv } from "@/env";
import { adminBantuan } from "@/routes/admin/bantuan";
import { adminDashboard } from "@/routes/admin/dashboard";
import { adminIntake } from "@/routes/admin/intake";
import { adminLeads } from "@/routes/admin/leads";
import { adminPayouts } from "@/routes/admin/payouts";
import { adminReferrers } from "@/routes/admin/referrers";
import { adminTenants } from "@/routes/admin/tenants";
import { requireAdmin } from "@/routes/middleware";

export const admin = new Hono<AppEnv>()
  .use("*", requireAdmin)
  .route("/", adminDashboard)
  .route("/", adminTenants)
  .route("/", adminLeads)
  .route("/", adminReferrers)
  .route("/", adminPayouts)
  .route("/", adminIntake)
  .route("/", adminBantuan);
