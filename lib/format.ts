const dateTimeFormatter = new Intl.DateTimeFormat("zh-TW", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return dateTimeFormatter.format(typeof date === "string" ? new Date(date) : date);
}
