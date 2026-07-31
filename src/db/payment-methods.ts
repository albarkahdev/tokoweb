export type PaymentMethodType = "qris" | "transfer" | "ewallet";

export type PaymentMethodRow = {
  id: number;
  tenant_id: number;
  type: PaymentMethodType;
  label: string;
  detail: string;
  image_key: string | null;
  active: number;
  sort: number;
  created_at: string;
};

const COLUMNS = "id, tenant_id, type, label, detail, image_key, active, sort, created_at";

export async function listPaymentMethods(
  db: D1Database,
  tenantId: number,
): Promise<PaymentMethodRow[]> {
  const { results } = await db
    .prepare(
      `SELECT ${COLUMNS} FROM tenant_payment_methods WHERE tenant_id = ?1 ORDER BY sort ASC, id ASC`,
    )
    .bind(tenantId)
    .all<PaymentMethodRow>();
  return results ?? [];
}

export async function listActivePaymentMethods(
  db: D1Database,
  tenantId: number,
): Promise<PaymentMethodRow[]> {
  const { results } = await db
    .prepare(
      `SELECT ${COLUMNS} FROM tenant_payment_methods WHERE tenant_id = ?1 AND active = 1 ORDER BY sort ASC, id ASC`,
    )
    .bind(tenantId)
    .all<PaymentMethodRow>();
  return results ?? [];
}

export async function findPaymentMethod(
  db: D1Database,
  id: number,
  tenantId: number,
): Promise<PaymentMethodRow | null> {
  return await db
    .prepare(`SELECT ${COLUMNS} FROM tenant_payment_methods WHERE id = ?1 AND tenant_id = ?2`)
    .bind(id, tenantId)
    .first<PaymentMethodRow>();
}

export async function createPaymentMethod(
  db: D1Database,
  input: {
    tenantId: number;
    type: PaymentMethodType;
    label: string;
    detail: string;
    imageKey: string | null;
    sort: number;
  },
): Promise<number> {
  const row = await db
    .prepare(
      "INSERT INTO tenant_payment_methods (tenant_id, type, label, detail, image_key, active, sort) VALUES (?1, ?2, ?3, ?4, ?5, 1, ?6) RETURNING id",
    )
    .bind(input.tenantId, input.type, input.label, input.detail, input.imageKey, input.sort)
    .first<{ id: number }>();
  if (!row) throw new Error("Failed to create payment method");
  return row.id;
}

export async function updatePaymentMethod(
  db: D1Database,
  id: number,
  tenantId: number,
  input: { label: string; detail: string; imageKey: string | null },
): Promise<void> {
  await db
    .prepare(
      "UPDATE tenant_payment_methods SET label = ?3, detail = ?4, image_key = ?5 WHERE id = ?1 AND tenant_id = ?2",
    )
    .bind(id, tenantId, input.label, input.detail, input.imageKey)
    .run();
}

export async function setPaymentMethodActive(
  db: D1Database,
  id: number,
  tenantId: number,
  active: boolean,
): Promise<void> {
  await db
    .prepare("UPDATE tenant_payment_methods SET active = ?3 WHERE id = ?1 AND tenant_id = ?2")
    .bind(id, tenantId, active ? 1 : 0)
    .run();
}

export async function deletePaymentMethod(
  db: D1Database,
  id: number,
  tenantId: number,
): Promise<void> {
  await db
    .prepare("DELETE FROM tenant_payment_methods WHERE id = ?1 AND tenant_id = ?2")
    .bind(id, tenantId)
    .run();
}
