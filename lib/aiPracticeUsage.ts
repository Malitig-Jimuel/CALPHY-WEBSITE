export const DAILY_AI_QUESTION_LIMIT = 15;
export const USAGE_TIME_ZONE = "Asia/Manila";

export function manilaDayKey(now = new Date()) {
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: USAGE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
