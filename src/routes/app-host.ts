import { Hono } from "hono";
import type { AppEnv } from "@/env";
import { admin } from "@/routes/admin";
import { auth } from "@/routes/auth";
import { cmsGaleri } from "@/routes/cms/galeri";
import { cmsHome } from "@/routes/cms/home";
import { cmsInfo } from "@/routes/cms/info";
import { cmsMenu } from "@/routes/cms/menu";
import { cmsPesan } from "@/routes/cms/pesan";
import { cmsPromo } from "@/routes/cms/promo";
import { cmsStatistik } from "@/routes/cms/statistik";
import { cmsTema } from "@/routes/cms/tema";
import { attachSession, rejectCrossOriginWrites } from "@/routes/middleware";

export const appHost = new Hono<AppEnv>()
  .use("*", rejectCrossOriginWrites)
  .use("*", attachSession)
  .route("/", auth)
  .route("/admin", admin)
  .route("/", cmsHome)
  .route("/", cmsInfo)
  .route("/", cmsMenu)
  .route("/", cmsPromo)
  .route("/", cmsGaleri)
  .route("/", cmsPesan)
  .route("/", cmsStatistik)
  .route("/", cmsTema);
