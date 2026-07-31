import { Hono } from "hono";
import type { AppEnv } from "@/env";
import { admin } from "@/routes/admin";
import { auth } from "@/routes/auth";
import { cmsBantuan } from "@/routes/cms/bantuan";
import { cmsGaleri } from "@/routes/cms/galeri";
import { cmsHome } from "@/routes/cms/home";
import { cmsInfo } from "@/routes/cms/info";
import { cmsLangganan } from "@/routes/cms/langganan";
import { cmsMenu } from "@/routes/cms/menu";
import { cmsPesan } from "@/routes/cms/pesan";
import { cmsPesanan } from "@/routes/cms/pesanan";
import { cmsPesananSetelan } from "@/routes/cms/pesanan-setelan";
import { cmsPratinjau } from "@/routes/cms/pratinjau";
import { cmsPromo } from "@/routes/cms/promo";
import { cmsStatistik } from "@/routes/cms/statistik";
import { cmsTema } from "@/routes/cms/tema";
import { intake } from "@/routes/intake";
import { attachSession, rejectCrossOriginWrites, securityHeaders } from "@/routes/middleware";
import { notFoundHtml, serverErrorHtml } from "@/ui/error-page";

export const appHost = new Hono<AppEnv>()
  .notFound((c) => c.html(notFoundHtml("/"), 404))
  .onError((error, c) => {
    console.error(error);
    return c.html(serverErrorHtml(c.req.path), 500);
  })
  .use("*", securityHeaders)
  .use("*", rejectCrossOriginWrites)
  .use("*", attachSession)
  .route("/", auth)
  .route("/", intake)
  .route("/admin", admin)
  .route("/", cmsHome)
  .route("/", cmsInfo)
  .route("/", cmsLangganan)
  .route("/", cmsMenu)
  .route("/", cmsPromo)
  .route("/", cmsGaleri)
  .route("/", cmsPesan)
  .route("/", cmsPesananSetelan)
  .route("/", cmsPesanan)
  .route("/", cmsStatistik)
  .route("/", cmsTema)
  .route("/", cmsBantuan)
  .route("/", cmsPratinjau);
