export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  // Strip leading 1 (country code) for formatting
  const d = digits.startsWith("1") && digits.length > 10 ? digits.slice(1) : digits;

  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

export function toE164(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return value.trim();
}

export function isValidUSPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return (
    (digits.length === 10) ||
    (digits.length === 11 && digits.startsWith("1"))
  );
}
