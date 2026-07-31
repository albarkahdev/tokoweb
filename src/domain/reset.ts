const WA_PATTERN = /^62\d{8,13}$/;

export function normalizeWaNumber(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;
  return digits;
}

export function isValidWaNumber(input: string): boolean {
  return WA_PATTERN.test(normalizeWaNumber(input));
}

export function buildResetWaMessage(phone: string): string {
  return `[RESET PASSWORD] Nomor terdaftar: ${phone}. Mohon kirim link atur ulang password untuk akun ini.`;
}

export function resetWaLink(contactNumber: string, phone: string): string {
  return `https://wa.me/${contactNumber}?text=${encodeURIComponent(buildResetWaMessage(phone))}`;
}
