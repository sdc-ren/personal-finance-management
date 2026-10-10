import { describe, it, expect } from "vitest";
import {
  parseVietnameseAmount,
  parseVietnameseDate,
  parseVoiceInput,
  detectVoiceCommand,
} from "./voice-parse";

describe("parseVietnameseAmount", () => {
  it("đọc số bằng chữ cơ bản", () => {
    expect(parseVietnameseAmount("năm mươi nghìn")).toBe(50_000);
    expect(parseVietnameseAmount("một trăm nghìn")).toBe(100_000);
    expect(parseVietnameseAmount("một trăm hai mươi nghìn")).toBe(120_000);
    expect(parseVietnameseAmount("ba mươi lăm ngàn")).toBe(35_000);
    expect(parseVietnameseAmount("hai trăm nghìn")).toBe(200_000);
  });

  it("đọc biến thể miền (mốt/tư/lăm/lẻ)", () => {
    expect(parseVietnameseAmount("hai mươi mốt nghìn")).toBe(21_000);
    expect(parseVietnameseAmount("hai mươi tư nghìn")).toBe(24_000);
    expect(parseVietnameseAmount("hai mươi lăm nghìn")).toBe(25_000);
    expect(parseVietnameseAmount("một trăm lẻ năm nghìn")).toBe(105_000);
    expect(parseVietnameseAmount("một trăm linh năm nghìn")).toBe(105_000);
  });

  it("đọc triệu / tỷ / rưỡi", () => {
    expect(parseVietnameseAmount("hai triệu")).toBe(2_000_000);
    expect(parseVietnameseAmount("hai triệu rưỡi")).toBe(2_500_000);
    expect(parseVietnameseAmount("một triệu năm trăm nghìn")).toBe(1_500_000);
    expect(parseVietnameseAmount("hai tỷ")).toBe(2_000_000_000);
    expect(parseVietnameseAmount("một trăm rưỡi nghìn")).toBe(150_000);
    expect(parseVietnameseAmount("hai mươi rưỡi nghìn")).toBe(25_000);
    expect(parseVietnameseAmount("năm chục nghìn")).toBe(50_000);
  });

  it("đọc dạng số", () => {
    expect(parseVietnameseAmount("50 nghìn")).toBe(50_000);
    expect(parseVietnameseAmount("1,5 triệu")).toBe(1_500_000);
    expect(parseVietnameseAmount("200k")).toBe(200_000);
    expect(parseVietnameseAmount("50.000")).toBe(50_000);
    expect(parseVietnameseAmount("50000")).toBe(50_000);
    expect(parseVietnameseAmount("2 tỷ")).toBe(2_000_000_000);
    expect(parseVietnameseAmount("50000đ")).toBe(50_000);
    expect(parseVietnameseAmount("2 tỉ")).toBe(2_000_000_000);
  });

  it("trả null khi không có số tiền", () => {
    expect(parseVietnameseAmount("")).toBeNull();
    expect(parseVietnameseAmount("xin chào")).toBeNull();
    expect(parseVietnameseAmount("hôm qua")).toBeNull();
  });
});

describe("parseVietnameseDate", () => {
  // Cố định "hôm nay" = 10/10/2026 (thứ Bảy)
  const now = new Date(2026, 9, 10, 12, 0, 0);

  function ymd(d: Date | null) {
    expect(d).not.toBeNull();
    return `${d!.getFullYear()}-${d!.getMonth() + 1}-${d!.getDate()}`;
  }

  it("ngày tương đối", () => {
    expect(ymd(parseVietnameseDate("hôm nay", now)?.date ?? null)).toBe("2026-10-10");
    expect(ymd(parseVietnameseDate("hôm qua", now)?.date ?? null)).toBe("2026-10-9");
    expect(ymd(parseVietnameseDate("hôm kia", now)?.date ?? null)).toBe("2026-10-8");
    expect(ymd(parseVietnameseDate("3 ngày trước", now)?.date ?? null)).toBe("2026-10-7");
  });

  it("ngày trong tháng", () => {
    expect(ymd(parseVietnameseDate("ngày 5", now)?.date ?? null)).toBe("2026-10-5");
    // "ngày 15" trong tương lai -> hiểu là tháng trước
    expect(ymd(parseVietnameseDate("ngày 15", now)?.date ?? null)).toBe("2026-9-15");
    expect(ymd(parseVietnameseDate("mùng 3 tháng trước", now)?.date ?? null)).toBe("2026-9-3");
    expect(ymd(parseVietnameseDate("ngày 12 tháng 9", now)?.date ?? null)).toBe("2026-9-12");
  });

  it("thứ trong tuần", () => {
    // 10/10/2026 là thứ Bảy -> thứ hai gần nhất là 5/10
    expect(ymd(parseVietnameseDate("thứ hai", now)?.date ?? null)).toBe("2026-10-5");
    expect(ymd(parseVietnameseDate("thứ hai tuần trước", now)?.date ?? null)).toBe("2026-9-28");
    expect(ymd(parseVietnameseDate("chủ nhật tuần trước", now)?.date ?? null)).toBe("2026-10-4");
    // "chủ nhật tuần này" = 11/10 (tương lai) -> lùi về chủ nhật vừa rồi 4/10
    expect(ymd(parseVietnameseDate("chủ nhật tuần này", now)?.date ?? null)).toBe("2026-10-4");
  });

  it("mốc tháng/tuần", () => {
    expect(ymd(parseVietnameseDate("đầu tháng", now)?.date ?? null)).toBe("2026-10-1");
    expect(ymd(parseVietnameseDate("cuối tháng", now)?.date ?? null)).toBe("2026-10-31");
    expect(ymd(parseVietnameseDate("giữa tháng", now)?.date ?? null)).toBe("2026-10-15");
  });

  it("trả null khi không có ngày", () => {
    expect(parseVietnameseDate("năm mươi nghìn", now)).toBeNull();
  });
});

describe("parseVoiceInput", () => {
  const now = new Date(2026, 9, 10, 12, 0, 0);

  it("tách số tiền + ngày trong một câu", () => {
    const r = parseVoiceInput("năm mươi nghìn hôm qua", now);
    expect(r.amount).toBe(50_000);
    expect(r.dateExplicit).toBe(true);
    expect(`${r.date.getFullYear()}-${r.date.getMonth() + 1}-${r.date.getDate()}`).toBe(
      "2026-10-9"
    );
  });

  it("không nhắc ngày -> mặc định hôm nay", () => {
    const r = parseVoiceInput("một trăm hai mươi nghìn", now);
    expect(r.amount).toBe(120_000);
    expect(r.dateExplicit).toBe(false);
    expect(r.date.getDate()).toBe(10);
  });

  it("ngày viết kiểu mùng + số tiền dạng số", () => {
    const r = parseVoiceInput("200k mùng 5 tháng này", now);
    expect(r.amount).toBe(200_000);
    expect(r.date.getDate()).toBe(5);
  });
});

describe("detectVoiceCommand", () => {
  it("nhận lệnh lưu / kết thúc", () => {
    expect(detectVoiceCommand("lưu")).toBe("save");
    expect(detectVoiceCommand("xong")).toBe("save");
    expect(detectVoiceCommand("kết thúc")).toBe("finish");
    expect(detectVoiceCommand("dừng lại")).toBe("finish");
    expect(detectVoiceCommand("năm mươi nghìn")).toBeNull();
  });
});
