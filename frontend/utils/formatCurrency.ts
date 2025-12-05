export function formatCurrency(amount?: number): string {
  if (amount == null) return '';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
}
