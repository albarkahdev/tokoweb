const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const CODE_PATTERN = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

export function generateReferralCode(random: () => number): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    const index = Math.floor(random() * CODE_ALPHABET.length);
    code += CODE_ALPHABET.charAt(Math.min(index, CODE_ALPHABET.length - 1));
  }
  return code;
}

export function isValidReferralCode(code: string): boolean {
  return CODE_PATTERN.test(code);
}

export const PIN_PATTERN = /^\d{6}$/;

export function isValidPin(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}
