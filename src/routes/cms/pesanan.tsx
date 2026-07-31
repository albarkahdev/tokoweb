import { Hono } from "hono";
import {
  findOrderByCode,
  getOrderById,
  listOrderItems,
  listOrders,
  listOrdersForCsv,
  type OrderRow,
  saveOrderTransition,
  setOrderPayment,
} from "@/db/orders";
import { formatRupiah } from "@/domain/money";
import { applyTransition, ORDER_STATUS_LABELS, type OrderStatus } from "@/domain/order";
import { buildOrdersCsv, ordersCsvFilename } from "@/domain/order-csv";
import {
  PAYMENT_TYPE_LABELS,
  parsePaymentSnapshot,
  paymentMethodLines,
} from "@/domain/payment-method";
import { sqlUtcDateTime } from "@/domain/stats";
import { wibDateOf } from "@/domain/subscription";
import type { AppEnv } from "@/env";
import { type CmsContext, CmsPage, html, loadCms } from "@/routes/cms/shared";
import {
  Actions,
  Badge,
  Card,
  CardTitle,
  Cell,
  CellStack,
  DataList,
  EmptyState,
  ListTable,
  Row,
  Text,
  TextLink,
} from "@/ui/display";
import { Button, Form } from "@/ui/form";
import { renderOrderInvoiceHtml } from "@/ui/invoice";

const ACTIONABLE: OrderStatus[] = ["baru", "cek_bayar"];

const ACTION_TARGET: Record<string, OrderStatus> = {
  konfirmasi: "menunggu_bayar",
  terima: "diproses",
  verifikasi: "diproses",
  tolak: "menunggu_bayar",
  siap: "siap",
  selesai: "selesai",
  batal: "dibatalkan",
};

const NOTIFY_SCRIPT = `
(function(){
  var el = document.querySelector("[data-actionable]");
  if(!el) return;
  var n = Number(el.getAttribute("data-actionable")) || 0;
  var prev = Number(localStorage.getItem("tw_orders_seen") || "0");
  if(n > prev){
    try {
      var ac = new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = "sine"; o.frequency.value = 880; g.gain.value = 0.08;
      o.start(); o.stop(ac.currentTime + 0.25);
    } catch(e){}
  }
  localStorage.setItem("tw_orders_seen", String(n));
  setTimeout(function(){ location.reload(); }, 20000);
})();
`;

function wib(ts: string | null): string {
  if (!ts) return "-";
  return new Date(`${ts}Z`).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
}

function statusBadge(status: OrderStatus) {
  const tone: "success" | "warning" | "muted" =
    status === "selesai" || status === "diproses" || status === "siap"
      ? "success"
      : status === "dibatalkan"
        ? "muted"
        : status === "baru" || status === "cek_bayar"
          ? "warning"
          : "muted";
  return <Badge tone={tone}>{ORDER_STATUS_LABELS[status]}</Badge>;
}

function fulfillmentLabel(order: OrderRow): string {
  return order.fulfillment === "dine_in" ? `Meja ${order.table_no ?? "-"}` : "Ambil sendiri";
}

function InboxPage(props: {
  cms: CmsContext;
  orders: OrderRow[];
  notice?: string;
  error?: string;
}) {
  const actionable = props.orders.filter((order) => ACTIONABLE.includes(order.status));
  const rest = props.orders.filter((order) => !ACTIONABLE.includes(order.status));
  return (
    <CmsPage
      title="Pesanan"
      currentPath="/pesanan"
      cms={props.cms}
      notice={props.notice}
      error={props.error}
    >
      <Card>
        <CardTitle>
          Perlu ditangani{" "}
          <Badge tone={actionable.length > 0 ? "warning" : "muted"}>{actionable.length}</Badge>
        </CardTitle>
        <Text small muted>
          Konfirmasi pesanan baru, lalu verifikasi pembayaran. Halaman ini berbunyi & menyegar
          otomatis saat ada pesanan baru.
        </Text>
        <Text small>
          <TextLink href="/pesanan/setelan">⚙️ Setelan & metode bayar</TextLink> ·{" "}
          <TextLink href="/pesanan/meja">🍽️ QR meja</TextLink> ·{" "}
          <TextLink href="/pesanan/export.csv" external>
            ⬇️ Export CSV
          </TextLink>
        </Text>
        <span data-actionable={String(actionable.length)} hidden />
        {actionable.length === 0 ? (
          <EmptyState
            icon="🧾"
            title="Tidak ada yang perlu ditangani"
            hint="Pesanan baru dari pembeli akan muncul di sini."
          />
        ) : (
          <ListTable headers={["Pesanan", "Total", ""]}>
            {actionable.map((order) => (
              <Row>
                <CellStack
                  top={
                    <>
                      #{order.code} {statusBadge(order.status)}
                    </>
                  }
                  bottom={`${order.customer_name} · ${fulfillmentLabel(order)} · ${wib(order.created_at)}`}
                />
                <Cell>{formatRupiah(order.total)}</Cell>
                <Cell>
                  <TextLink href={`/pesanan/${order.code}`}>Buka</TextLink>
                </Cell>
              </Row>
            ))}
          </ListTable>
        )}
      </Card>
      <Card>
        <CardTitle>Semua pesanan ({props.orders.length})</CardTitle>
        {rest.length === 0 && actionable.length === 0 ? (
          <EmptyState icon="📭" title="Belum ada pesanan" />
        ) : (
          <ListTable headers={["Pesanan", "Total", ""]}>
            {rest.map((order) => (
              <Row>
                <CellStack
                  top={
                    <>
                      #{order.code} {statusBadge(order.status)}
                    </>
                  }
                  bottom={`${order.customer_name} · ${fulfillmentLabel(order)} · ${wib(order.created_at)}`}
                />
                <Cell>{formatRupiah(order.total)}</Cell>
                <Cell>
                  <TextLink href={`/pesanan/${order.code}`}>Buka</TextLink>
                </Cell>
              </Row>
            ))}
          </ListTable>
        )}
      </Card>
      <script dangerouslySetInnerHTML={{ __html: NOTIFY_SCRIPT }} />
    </CmsPage>
  );
}

function OrderActions(props: { order: OrderRow; readOnly: boolean }) {
  const { order } = props;
  if (props.readOnly) return null;
  const actions: {
    action: string;
    label: string;
    variant?: "primary" | "secondary" | "danger";
    confirm?: string;
  }[] = [];
  if (order.status === "baru") {
    if (order.cash === 1) {
      actions.push({ action: "terima", label: "Terima & buat pesanan (bayar tunai)" });
    } else {
      actions.push({ action: "konfirmasi", label: "Konfirmasi & buka pembayaran" });
    }
    actions.push({
      action: "batal",
      label: "Tolak pesanan",
      variant: "danger",
      confirm: "Batalkan pesanan ini?",
    });
  } else if (order.status === "menunggu_bayar") {
    actions.push({
      action: "batal",
      label: "Batalkan",
      variant: "danger",
      confirm: "Batalkan pesanan ini?",
    });
  } else if (order.status === "cek_bayar") {
    actions.push({ action: "verifikasi", label: "Terima pembayaran → proses" });
    actions.push({ action: "tolak", label: "Tolak bukti bayar", variant: "secondary" });
    actions.push({
      action: "batal",
      label: "Batalkan",
      variant: "danger",
      confirm: "Batalkan pesanan ini?",
    });
  } else if (order.status === "diproses") {
    actions.push({
      action: "siap",
      label: order.fulfillment === "dine_in" ? "Tandai siap disajikan" : "Tandai siap diambil",
    });
    actions.push({ action: "selesai", label: "Tandai selesai", variant: "secondary" });
  } else if (order.status === "siap") {
    actions.push({ action: "selesai", label: "Tandai selesai" });
  }
  if (actions.length === 0) return null;
  return (
    <Card>
      <CardTitle>Tindakan</CardTitle>
      <Actions>
        {actions.map((a) => (
          <Form action={`/pesanan/${order.code}/${a.action}`} confirm={a.confirm}>
            <Button variant={a.variant}>{a.label}</Button>
          </Form>
        ))}
      </Actions>
    </Card>
  );
}

function DetailPage(props: {
  cms: CmsContext;
  order: OrderRow;
  items: { name: string; qty: number; unit_price: number; item_note: string | null }[];
  methodLabel: string | null;
  error?: string;
}) {
  const { order } = props;
  return (
    <CmsPage
      title={`Pesanan #${order.code}`}
      currentPath="/pesanan"
      cms={props.cms}
      error={props.error}
    >
      <Card>
        <CardTitle>
          #{order.code} {statusBadge(order.status)}
        </CardTitle>
        <Text small muted>
          <TextLink href="/pesanan">← Semua pesanan</TextLink> ·{" "}
          <TextLink href={`/pesanan/${order.code}/invoice`} external>
            Cetak invoice
          </TextLink>
        </Text>
        <DataList
          rows={[
            { label: "Pembeli", value: order.customer_name },
            { label: "Kontak", value: order.customer_phone ?? order.customer_email ?? "-" },
            {
              label: "Jenis",
              value:
                order.fulfillment === "dine_in"
                  ? `Makan di tempat · Meja ${order.table_no ?? "-"}`
                  : "Ambil sendiri",
            },
            { label: "Catatan", value: order.note ?? "-" },
            { label: "Metode bayar", value: props.methodLabel ?? "-" },
            { label: "Masuk", value: wib(order.created_at) },
          ]}
        />
      </Card>
      <Card>
        <CardTitle>Item</CardTitle>
        <ListTable headers={["Item", "Total"]}>
          {props.items.map((item) => (
            <Row>
              <CellStack
                top={`${item.qty}× ${item.name}`}
                bottom={item.item_note ? item.item_note : `@ ${formatRupiah(item.unit_price)}`}
              />
              <Cell>{formatRupiah(item.unit_price * item.qty)}</Cell>
            </Row>
          ))}
        </ListTable>
        <DataList
          rows={[
            { label: "Subtotal", value: formatRupiah(order.subtotal) },
            ...(order.tax_amount > 0
              ? [{ label: "Pajak", value: formatRupiah(order.tax_amount) }]
              : []),
            ...(order.fee_amount > 0
              ? [{ label: "Biaya", value: formatRupiah(order.fee_amount) }]
              : []),
            { label: "Total", value: formatRupiah(order.total) },
          ]}
        />
      </Card>
      {(() => {
        const snap = parsePaymentSnapshot(order.payment_snapshot);
        if (!snap) return null;
        const lines = paymentMethodLines(snap.type, snap.detail);
        return (
          <Card>
            <CardTitle>Tujuan bayar (saat pesan)</CardTitle>
            <Text small muted>
              {PAYMENT_TYPE_LABELS[snap.type]} · {snap.label}
            </Text>
            {snap.image_key ? (
              <img src={`/img/${snap.image_key}`} alt="QR pembayaran" class="cms-media-img sm" />
            ) : null}
            {lines.length > 0 ? (
              <DataList rows={lines.map((line) => ({ label: line.label, value: line.value }))} />
            ) : null}
          </Card>
        );
      })()}
      {order.proof_key ? (
        <Card>
          <CardTitle>Bukti bayar</CardTitle>
          <img src={`/img/${order.proof_key}`} alt="Bukti pembayaran" class="cms-media-img" />
        </Card>
      ) : null}
      <OrderActions order={order} readOnly={props.cms.readOnly} />
    </CmsPage>
  );
}

function paymentLabel(order: OrderRow): string | null {
  const snap = parsePaymentSnapshot(order.payment_snapshot);
  if (snap) return `${PAYMENT_TYPE_LABELS[snap.type]} · ${snap.label}`;
  if (order.cash === 1) return "Tunai (bayar di tempat)";
  return null;
}

export const cmsPesanan = new Hono<AppEnv>()
  .get("/pesanan/export.csv", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const rows = await listOrdersForCsv(c.env.DB, cms.tenant.id, 5000);
    const csv = `﻿${buildOrdersCsv(rows)}`;
    return c.body(csv, 200, {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${ordersCsvFilename(cms.tenant.slug, wibDateOf(Date.now()))}"`,
      "cache-control": "no-store",
    });
  })
  .get("/pesanan", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const orders = await listOrders(c.env.DB, cms.tenant.id);
    return c.html(
      html(
        <InboxPage
          cms={cms}
          orders={orders}
          notice={c.req.query("ok")}
          error={c.req.query("err")}
        />,
      ),
    );
  })
  .get("/pesanan/:code", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const order = await findOrderByCode(c.env.DB, cms.tenant.id, c.req.param("code"));
    if (!order) return c.redirect("/pesanan?err=Pesanan tidak ditemukan.");
    const items = await listOrderItems(c.env.DB, order.id);
    const methodLabel = paymentLabel(order);
    return c.html(
      html(
        <DetailPage
          cms={cms}
          order={order}
          items={items}
          methodLabel={methodLabel}
          error={c.req.query("err")}
        />,
      ),
    );
  })
  .get("/pesanan/:code/invoice", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const order = await findOrderByCode(c.env.DB, cms.tenant.id, c.req.param("code"));
    if (!order) return c.redirect("/pesanan?err=Pesanan tidak ditemukan.");
    const items = await listOrderItems(c.env.DB, order.id);
    const methodLabel = paymentLabel(order);
    const info = cms.tenant;
    return c.html(
      renderOrderInvoiceHtml(
        {
          code: order.code,
          dateLabel: wib(order.created_at),
          business: info.name,
          customerName: order.customer_name,
          fulfillmentLabel:
            order.fulfillment === "dine_in"
              ? `Makan di tempat · Meja ${order.table_no ?? "-"}`
              : "Ambil sendiri",
          statusLabel: ORDER_STATUS_LABELS[order.status].toUpperCase(),
          paid: order.status === "selesai" || (order.status === "diproses" && order.cash !== 1),
          items,
          subtotal: order.subtotal,
          taxAmount: order.tax_amount,
          feeAmount: order.fee_amount,
          total: order.total,
          note: order.note ?? undefined,
          method: methodLabel ?? undefined,
        },
        `/pesanan/${order.code}`,
      ),
    );
  })
  .post("/pesanan/:code/:action", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const code = c.req.param("code");
    if (cms.readOnly) return c.redirect(`/pesanan/${code}`);
    const target = ACTION_TARGET[c.req.param("action")];
    if (!target) return c.redirect(`/pesanan/${code}`);
    const order = await getOrderByCodeScoped(c, cms.tenant.id, code);
    if (!order) return c.redirect("/pesanan?err=Pesanan tidak ditemukan.");
    try {
      const next = applyTransition(order, target, sqlUtcDateTime(Date.now()));
      if (c.req.param("action") === "tolak") {
        next.paid_at = null;
        await setOrderPayment(c.env.DB, order.id, cms.tenant.id, null, null, null);
      }
      await saveOrderTransition(c.env.DB, order.id, cms.tenant.id, next);
    } catch {
      return c.redirect(`/pesanan/${code}?err=Tindakan tidak valid untuk status saat ini.`);
    }
    return c.redirect(`/pesanan/${code}`);
  });

async function getOrderByCodeScoped(
  c: Parameters<typeof loadCms>[0],
  tenantId: number,
  code: string,
): Promise<OrderRow | null> {
  const order = await findOrderByCode(c.env.DB, tenantId, code);
  if (!order) return null;
  return getOrderById(c.env.DB, order.id, tenantId);
}
