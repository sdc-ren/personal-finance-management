import { describe, expect, it } from "vitest";
import {
  createAppDate,
  formatAppDateParam,
  getAppDateParts,
  getAppMonthRange,
  getPreviousAppMonthRange,
  parseDateParam,
  relativeDayLabel,
} from "@/lib/app-time";

describe("app-time", () => {
  it("creates VN-local date correctly from year/month/day", () => {
    const date = createAppDate(2026, 2, 1, 0, 0, 0, 0);

    expect(date.toISOString()).toBe("2026-01-31T17:00:00.000Z");
    expect(getAppDateParts(date)).toEqual({ year: 2026, month: 2, day: 1 });
  });

  it("returns current month and previous month ranges in app timezone", () => {
    const reference = createAppDate(2026, 2, 23, 12, 0, 0, 0);

    const current = getAppMonthRange(reference);
    const previous = getPreviousAppMonthRange(reference);

    expect(current.start.toISOString()).toBe("2026-01-31T17:00:00.000Z");
    expect(current.end.toISOString()).toBe("2026-02-28T16:59:59.999Z");

    expect(previous.start.toISOString()).toBe("2025-12-31T17:00:00.000Z");
    expect(previous.end.toISOString()).toBe("2026-01-31T16:59:59.999Z");
  });

  it("formats and parses date params without day shifting", () => {
    const parsed = parseDateParam("2026-02-23");

    expect(parsed).toBeDefined();
    expect(getAppDateParts(parsed as Date)).toEqual({ year: 2026, month: 2, day: 23 });
    expect(formatAppDateParam(parsed as Date)).toBe("2026-02-23");
  });

  it("returns undefined for invalid date params", () => {
    expect(parseDateParam(undefined)).toBeUndefined();
    expect(parseDateParam("invalid-date")).toBeUndefined();
  });
});

describe("relativeDayLabel", () => {
  it("labels today/yesterday/day-before relatively", () => {
    const now = new Date();
    const mk = (offsetDays: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + offsetDays);
      return d;
    };
    expect(relativeDayLabel(mk(0))).toBe("Hôm nay");
    expect(relativeDayLabel(mk(-1))).toBe("Hôm qua");
    expect(relativeDayLabel(mk(-2))).toBe("Hôm kia");
    expect(relativeDayLabel(mk(-5))).toMatch(/, \d{1,2}\/\d{1,2}$/);
  });

});
