import { format } from "date-fns";
import { vi } from "date-fns/locale";

const APP_TIMEZONE_OFFSET_HOURS = 7;
const APP_TIMEZONE_OFFSET_MS = APP_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000;

function shiftToAppTimezone(date: Date): Date {
  return new Date(date.getTime() + APP_TIMEZONE_OFFSET_MS);
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

export function createAppDate(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
): Date {
  return new Date(
    Date.UTC(year, month - 1, day, hour, minute, second, millisecond) - APP_TIMEZONE_OFFSET_MS
  );
}

export function getAppDateParts(date: Date): { year: number; month: number; day: number } {
  const shifted = shiftToAppTimezone(date);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export function getAppYearMonth(date: Date): { year: number; monthIndex: number } {
  const parts = getAppDateParts(date);
  return { year: parts.year, monthIndex: parts.month - 1 };
}

export function toAppStartOfDay(date: Date): Date {
  const { year, month, day } = getAppDateParts(date);
  return createAppDate(year, month, day, 0, 0, 0, 0);
}

export function toAppEndOfDay(date: Date): Date {
  const { year, month, day } = getAppDateParts(date);
  return createAppDate(year, month, day, 23, 59, 59, 999);
}

export function getAppMonthRange(referenceDate: Date = new Date()): { start: Date; end: Date } {
  const { year, month } = getAppDateParts(referenceDate);
  return {
    start: createAppDate(year, month, 1, 0, 0, 0, 0),
    end: createAppDate(year, month + 1, 0, 23, 59, 59, 999),
  };
}

export function getPreviousAppMonthRange(
  referenceDate: Date = new Date()
): { start: Date; end: Date } {
  const currentMonthStart = getAppMonthRange(referenceDate).start;
  return getAppMonthRange(new Date(currentMonthStart.getTime() - 1));
}

export function getAppMonthRangeFromYearMonth(
  year: number,
  monthIndex: number
): { start: Date; end: Date } {
  const month = monthIndex + 1;
  return {
    start: createAppDate(year, month, 1, 0, 0, 0, 0),
    end: createAppDate(year, month + 1, 0, 23, 59, 59, 999),
  };
}

export function formatAppDateParam(date: Date): string {
  const { year, month, day } = getAppDateParts(date);
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function parseDateParam(value: string | undefined): Date | undefined {
  if (!value) return undefined;

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = value.match(dateOnly);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    return createAppDate(year, month, day, 12, 0, 0, 0);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

/**
 * Nhãn ngày tương đối cho hiển thị: "Hôm nay", "Hôm qua", "Hôm kia",
 * hoặc "Thứ Hai, 12/10" cho các ngày xa hơn.
 */
export function relativeDayLabel(date: Date): string {
  const startOfDay = (d: Date) => {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c.getTime();
  };
  const diff = Math.round(
    (startOfDay(date) - startOfDay(new Date())) / 86_400_000
  );
  if (diff === 0) return "Hôm nay";
  if (diff === -1) return "Hôm qua";
  if (diff === -2) return "Hôm kia";
  return format(date, "EEEE, d/M", { locale: vi });
}

/**
 * Gom danh sách có trường `date` theo từng ngày (ngày mới nhất trước),
 * mỗi nhóm kèm nhãn hiển thị từ `relativeDayLabel`.
 */
export function groupByDay<T extends { date: Date }>(
  items: T[]
): { key: string; label: string; items: T[] }[] {
  const groups = new Map<string, { label: string; items: T[] }>();
  for (const item of items) {
    const d = new Date(item.date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    let g = groups.get(key);
    if (!g) {
      g = { label: relativeDayLabel(d), items: [] };
      groups.set(key, g);
    }
    g.items.push(item);
  }
  return [...groups.entries()].map(([key, g]) => ({ key, ...g }));
}
