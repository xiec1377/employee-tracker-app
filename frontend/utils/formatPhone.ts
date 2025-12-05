export function formatPhone(phone?: string): string {
  if (!phone) return ""

  // Keep only digits
  const digits = phone.replace(/\D/g, "");

  // US format (10 digits)
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // With country code (11+ digits)
  if (digits.length > 10) {
    const cc = digits.length - 10;
    return `+${digits.slice(0, cc)} (${digits.slice(
      cc,
      cc + 3
    )}) ${digits.slice(cc + 3, cc + 6)}-${digits.slice(cc + 6)}`;
  }

  // Fallback for short numbers
  return digits;
}

export function formatPhoneInput(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
