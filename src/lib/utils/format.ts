export const store = {
  name: "اسلام وحيد",
  email: "ca.markode@gmail.com",
  phone: "+20",
  currency: "EGP",
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: store.currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
