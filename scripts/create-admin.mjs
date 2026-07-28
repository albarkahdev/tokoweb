import { webcrypto as crypto } from "node:crypto";

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 8) {
  console.error("Pakai: npm run create-admin -- email@kamu.id password-min-8-karakter");
  process.exit(1);
}

const ITERATIONS = 100_000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const keyMaterial = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(password),
  "PBKDF2",
  false,
  ["deriveBits"],
);
const bits = await crypto.subtle.deriveBits(
  { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
  keyMaterial,
  256,
);
const toBase64 = (bytes) => Buffer.from(bytes).toString("base64");
const hash = `pbkdf2$${ITERATIONS}$${toBase64(salt)}$${toBase64(new Uint8Array(bits))}`;

const sql = `INSERT INTO users (email, password_hash, role, tenant_id) VALUES ('${email.toLowerCase()}', '${hash}', 'admin', NULL);`;
console.log("SQL siap jalan:\n");
console.log(sql);
console.log(
  '\nLokal :  npx wrangler d1 execute tokoweb --local --command "' +
    sql.replaceAll('"', '\\"') +
    '"',
);
console.log(
  'Prod  :  npx wrangler d1 execute tokoweb --remote --command "' +
    sql.replaceAll('"', '\\"') +
    '"',
);
