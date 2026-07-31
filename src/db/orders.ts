import type { Fulfillment, OrderState, OrderStatus } from "@/domain/order";

export type OrderRow = {
  id: number;
  tenant_id: number;
  code: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  fulfillment: Fulfillment;
  table_no: string | null;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  fee_amount: number;
  total: number;
  payment_method_id: number | null;
  proof_key: string | null;
  note: string | null;
  created_at: string;
  confirmed_at: string | null;
  paid_at: string | null;
  verified_at: string | null;
  processed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
};

export type OrderItemRow = {
  id: number;
  order_id: number;
  name: string;
  category: string | null;
  unit_price: number;
  qty: number;
  item_note: string | null;
};

export type OrderItemInput = {
  name: string;
  category: string | null;
  unit_price: number;
  qty: number;
  item_note: string | null;
};

export type CreateOrderInput = {
  tenantId: number;
  code: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  fulfillment: Fulfillment;
  tableNo: string | null;
  subtotal: number;
  taxAmount: number;
  feeAmount: number;
  total: number;
  note: string | null;
  items: OrderItemInput[];
};

const ORDER_COLUMNS =
  "id, tenant_id, code, customer_name, customer_email, customer_phone, fulfillment, table_no, status, subtotal, tax_amount, fee_amount, total, payment_method_id, proof_key, note, created_at, confirmed_at, paid_at, verified_at, processed_at, completed_at, cancelled_at";

export async function createOrder(db: D1Database, input: CreateOrderInput): Promise<OrderRow> {
  const order = await db
    .prepare(
      "INSERT INTO orders (tenant_id, code, customer_name, customer_email, customer_phone, fulfillment, table_no, subtotal, tax_amount, fee_amount, total, note) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12) RETURNING id",
    )
    .bind(
      input.tenantId,
      input.code,
      input.customerName,
      input.customerEmail,
      input.customerPhone,
      input.fulfillment,
      input.tableNo,
      input.subtotal,
      input.taxAmount,
      input.feeAmount,
      input.total,
      input.note,
    )
    .first<{ id: number }>();
  if (!order) throw new Error("Failed to create order");

  if (input.items.length > 0) {
    const stmt = db.prepare(
      "INSERT INTO order_items (order_id, name, category, unit_price, qty, item_note) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
    );
    await db.batch(
      input.items.map((item) =>
        stmt.bind(order.id, item.name, item.category, item.unit_price, item.qty, item.item_note),
      ),
    );
  }

  const created = await getOrderById(db, order.id, input.tenantId);
  if (!created) throw new Error("Failed to load created order");
  return created;
}

export async function getOrderById(
  db: D1Database,
  id: number,
  tenantId: number,
): Promise<OrderRow | null> {
  return await db
    .prepare(`SELECT ${ORDER_COLUMNS} FROM orders WHERE id = ?1 AND tenant_id = ?2`)
    .bind(id, tenantId)
    .first<OrderRow>();
}

export async function findOrderByCode(
  db: D1Database,
  tenantId: number,
  code: string,
): Promise<OrderRow | null> {
  return await db
    .prepare(`SELECT ${ORDER_COLUMNS} FROM orders WHERE tenant_id = ?1 AND code = ?2`)
    .bind(tenantId, code)
    .first<OrderRow>();
}

export async function listOrderItems(db: D1Database, orderId: number): Promise<OrderItemRow[]> {
  const { results } = await db
    .prepare(
      "SELECT id, order_id, name, category, unit_price, qty, item_note FROM order_items WHERE order_id = ?1 ORDER BY id ASC",
    )
    .bind(orderId)
    .all<OrderItemRow>();
  return results ?? [];
}

export async function listOrders(
  db: D1Database,
  tenantId: number,
  opts: { statuses?: OrderStatus[]; limit?: number } = {},
): Promise<OrderRow[]> {
  const limit = opts.limit ?? 100;
  if (opts.statuses && opts.statuses.length > 0) {
    const placeholders = opts.statuses.map((_, index) => `?${index + 2}`).join(", ");
    const { results } = await db
      .prepare(
        `SELECT ${ORDER_COLUMNS} FROM orders WHERE tenant_id = ?1 AND status IN (${placeholders}) ORDER BY created_at DESC, id DESC LIMIT ${limit}`,
      )
      .bind(tenantId, ...opts.statuses)
      .all<OrderRow>();
    return results ?? [];
  }
  const { results } = await db
    .prepare(
      `SELECT ${ORDER_COLUMNS} FROM orders WHERE tenant_id = ?1 ORDER BY created_at DESC, id DESC LIMIT ${limit}`,
    )
    .bind(tenantId)
    .all<OrderRow>();
  return results ?? [];
}

export async function countOrdersByStatus(
  db: D1Database,
  tenantId: number,
  statuses: OrderStatus[],
): Promise<number> {
  if (statuses.length === 0) return 0;
  const placeholders = statuses.map((_, index) => `?${index + 2}`).join(", ");
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM orders WHERE tenant_id = ?1 AND status IN (${placeholders})`,
    )
    .bind(tenantId, ...statuses)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function saveOrderTransition(
  db: D1Database,
  id: number,
  tenantId: number,
  next: OrderState,
): Promise<void> {
  await db
    .prepare(
      "UPDATE orders SET status = ?3, confirmed_at = ?4, paid_at = ?5, verified_at = ?6, processed_at = ?7, completed_at = ?8, cancelled_at = ?9 WHERE id = ?1 AND tenant_id = ?2",
    )
    .bind(
      id,
      tenantId,
      next.status,
      next.confirmed_at,
      next.paid_at,
      next.verified_at,
      next.processed_at,
      next.completed_at,
      next.cancelled_at,
    )
    .run();
}

export async function setOrderPayment(
  db: D1Database,
  id: number,
  tenantId: number,
  paymentMethodId: number | null,
  proofKey: string | null,
): Promise<void> {
  await db
    .prepare(
      "UPDATE orders SET payment_method_id = ?3, proof_key = ?4 WHERE id = ?1 AND tenant_id = ?2",
    )
    .bind(id, tenantId, paymentMethodId, proofKey)
    .run();
}
