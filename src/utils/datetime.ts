export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function formatDateTime(
  date: Date,
  locale: string,
  timeOnly: boolean
): string {
  if (timeOnly) {
    return new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDuration(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = Math.floor(durationMs / 60000);

  if (durationMinutes < 120) {
    return `${durationMinutes} min`;
  }

  const durationHours = Math.floor(durationMinutes / 60);
  if (durationHours === 24) {
    return "All day";
  }

  if (durationHours < 24) {
    return `${durationHours} ${durationHours === 1 ? "hour" : "hours"}`;
  }

  const durationDays = Math.floor(durationHours / 24);
  return `${durationDays} ${durationDays === 1 ? "day" : "days"}`;
}
