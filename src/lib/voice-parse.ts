/**
 * Parser tiếng Việt cho nhập liệu bằng giọng nói.
 *
 * Nhận một câu nói như "năm mươi nghìn, hôm qua" và tách ra:
 * - số tiền (VND): parseVietnameseAmount("năm mươi nghìn") -> 50000
 * - ngày: parseVietnameseDate("hôm qua") -> Date hôm qua
 *
 * Hỗ trợ cả dạng chữ ("một trăm hai mươi nghìn") lẫn dạng số ("120 nghìn",
 * "1,5 triệu", "200k", "50.000").
 */

const DIGITS: Record<string, number> = {
  "không": 0,
  "một": 1,
  "môt": 1,
  "hai": 2,
  "ba": 3,
  "bốn": 4,
  "bôn": 4,
  "năm": 5,
  "sáu": 6,
  "bảy": 7,
  "bẩy": 7,
  "tám": 8,
  "chín": 9,
  "mười": 10,
  "mốt": 1,
  "tư": 4,
  "lăm": 5,
};

const SMALL_SCALES: Record<string, number> = {
  "chục": 10,
  "trăm": 100,
};

const BIG_SCALES: Record<string, number> = {
  "nghìn": 1_000,
  "ngàn": 1_000,
  "triệu": 1_000_000,
  "tỉ": 1_000_000_000,
  "tỷ": 1_000_000_000,
};

const FILLERS = new Set(["lẻ", "linh", "đồng", "vnd", "vnđ"]);

function normalizeText(text: string): string {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[.,;:!?()"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Chuẩn hoá nhẹ: giữ nguyên dấu . , để "1,5 triệu" / "50.000" không bị vỡ.
 * Dùng cho tách ngày và đọc số dạng chữ số.
 */
function normalizeLight(text: string): string {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Đọc một dãy token số bằng chữ, ví dụ ["một","trăm","hai","mươi","lăm"] -> 125.
 * Trả về null nếu không đọc được gì.
 */
function parseWordNumber(tokens: string[]): number | null {
  let total = 0;
  let current = 0;
  let lastAdd = 0; // giá trị vừa cộng vào current (để "mươi"/"trăm" nhân đúng chỗ)
  let lastScale = 1;
  let seen = false;

  for (const raw of tokens) {
    const t = raw.trim();
    if (!t || FILLERS.has(t)) continue;

    if (t === "rưỡi" || t === "nửa") {
      // "hai triệu rưỡi" -> +0.5 * 1_000_000 ; "một trăm rưỡi" -> +50
      if (current > 0) current += 0.5 * lastScale;
      else total += 0.5 * lastScale;
      seen = true;
      continue;
    }

    if (t in DIGITS) {
      const d = DIGITS[t];
      current += d;
      lastAdd = d;
      seen = true;
      continue;
    }

    if (t === "mươi") {
      // "năm mươi": biến số vừa cộng (5) thành 50
      if (lastAdd > 0) {
        current = current - lastAdd + lastAdd * 10;
        lastAdd = lastAdd * 10;
      } else {
        current += 10;
        lastAdd = 10;
      }
      lastScale = 10; // để "hai mươi rưỡi" = 25 đúng
      seen = true;
      continue;
    }

    if (t in SMALL_SCALES) {
      const s = SMALL_SCALES[t];
      const base = lastAdd > 0 ? lastAdd : 1;
      current = current - (lastAdd > 0 ? lastAdd : 0) + base * s;
      lastAdd = base * s;
      lastScale = s;
      seen = true;
      continue;
    }

    if (t in BIG_SCALES) {
      const s = BIG_SCALES[t];
      const base = current > 0 ? current : 1;
      total += base * s;
      current = 0;
      lastAdd = 0;
      lastScale = s;
      seen = true;
      continue;
    }

    // token lạ xen giữa (vd "khoảng", "tầm") -> bỏ qua để parser đỡ gãy
    if (t === "khoảng" || t === "tầm" || t === "cỡ") continue;
    return null;
  }

  if (!seen) return null;
  return total + current;
}

/** "50k" -> 50000 ; "1,5 triệu" -> 1500000 ; "50.000" -> 50000 */
function parseDigitAmount(text: string): number | null {
  // Giữ lại chữ/số/dấu . , (bỏ dấu câu khác) để "1,5 triệu" không bị vỡ
  const t = text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^0-9a-zà-ỹđ.,\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Lưu ý: \b của JS chỉ hiểu ký tự ASCII nên "tỷ"/"đ" ở cuối chuỗi làm \b gãy.
  // Dùng lookahead "không phải chữ/số" thay cho \b.
  const notWord = "(?![0-9a-zà-ỹđ])";

  // Dạng "200k" / "200K"
  const kMatch = t.match(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*k${notWord}`, "i"));
  if (kMatch) {
    const n = Number(kMatch[1].replace(",", "."));
    if (Number.isFinite(n) && n > 0) return Math.round(n * 1_000);
  }

  // Dạng số + đơn vị chữ: "50 nghìn", "1,5 triệu", "2 tỷ", "50000đ"
  const unitMatch = t.match(
    new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(nghìn|ngàn|triệu|tỷ|tỉ|đồng|đ)${notWord}`)
  );
  if (unitMatch) {
    const n = Number(unitMatch[1].replace(",", "."));
    const unit = unitMatch[2];
    const mult =
      unit === "triệu" ? 1_000_000
      : unit === "tỷ" || unit === "tỉ" ? 1_000_000_000
      : unit === "nghìn" || unit === "ngàn" ? 1_000
      : 1; // "đồng" / "đ"
    if (Number.isFinite(n) && n > 0) return Math.round(n * mult);
  }

  // Dạng số trần: "50000" hoặc "50.000" (dấu chấm = phân tách nghìn kiểu VN)
  const plainMatch = t.match(/\d[\d.,]*/);
  if (plainMatch) {
    const raw = plainMatch[0];
    // "1,5" không đơn vị -> mơ hồ (1.5 hay 15?) -> bỏ qua để parser chữ xử lý
    if (/^\d+,\d+$/.test(raw)) return null;
    const n = Number(raw.replace(/[.,]/g, ""));
    if (Number.isFinite(n) && n > 0) return n;
  }

  return null;
}

/**
 * Đọc số tiền VND từ một câu nói. Trả về số nguyên (đồng) hoặc null.
 * Ví dụ: "năm mươi nghìn" -> 50000, "hai triệu rưỡi" -> 2500000.
 */
export function parseVietnameseAmount(text: string): number | null {
  if (!text || !text.trim()) return null;

  // Ưu tiên dạng số ("50 nghìn", "200k") vì ít mơ hồ hơn dạng chữ.
  // (parseDigitAmount tự chuẩn hoá nhẹ, giữ dấu . , )
  const digit = parseDigitAmount(text);
  if (digit !== null) return digit;

  const t = normalizeText(text);
  if (!t) return null;

  const word = parseWordNumber(t.split(" "));
  if (word === null || word <= 0) return null;
  return Math.round(word);
}

// ---------------------------------------------------------------------------
// Ngày tháng
// ---------------------------------------------------------------------------

export interface ParsedDate {
  date: Date;
  /** Đoạn text đã khớp, để caller cắt ra khỏi câu trước khi parse số tiền */
  matched: string;
}

function atNoon(d: Date): Date {
  const c = new Date(d);
  c.setHours(12, 0, 0, 0);
  return c;
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return atNoon(c);
}

const WEEKDAYS: Record<string, number> = {
  "chủ nhật": 0,
  "cn": 0,
  "thứ hai": 1,
  "thứ 2": 1,
  "thứ ba": 2,
  "thứ 3": 2,
  "thứ tư": 3,
  "thứ 4": 3,
  "thứ năm": 4,
  "thứ 5": 4,
  "thứ sáu": 5,
  "thứ 6": 5,
  "thứ bảy": 6,
  "thứ 7": 6,
};

/** Ngày thứ X gần nhất trong quá khứ (kể cả hôm nay nếu trùng). */
function recentWeekday(now: Date, weekday: number): Date {
  const diff = (now.getDay() - weekday + 7) % 7;
  return addDays(now, -diff);
}

/**
 * Đọc ngày từ câu nói. Trả về null nếu không thấy mốc ngày nào.
 * `now` để test được (mặc định = hôm nay).
 */
export function parseVietnameseDate(text: string, now: Date = new Date()): ParsedDate | null {
  const t = normalizeLight(text);
  const today = atNoon(now);

  // "3 ngày trước"
  let m = t.match(/(\d+)\s*ngày\s*trước/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n > 0 && n <= 365) return { date: addDays(today, -n), matched: m[0] };
  }

  // "hôm kia" / "hôm qua" / "hôm nay" (chịu được dấu phẩy xung quanh)
  const relDay = (word: string, offset: number): ParsedDate | null => {
    const mm = t.match(new RegExp(`(^|[\\s,])${word}([\\s,]|$)`, "i"));
    if (!mm) return null;
    // gọt dấu câu/dấu cách ở biên để replace chính xác trong parseVoiceInput
    const matched = mm[0].replace(/^[\s,]+|[\s,]+$/g, "");
    return { date: offset === 0 ? today : addDays(today, offset), matched };
  };
  for (const [word, offset] of [["hôm\\s+kia", -2], ["hôm\\s+qua", -1], ["hôm\\s+nay", 0]] as const) {
    const found = relDay(word, offset);
    if (found) return found;
  }

  // "thứ hai tuần trước" / "chủ nhật vừa rồi" / "thứ 5 tuần này" / "thứ hai"
  // Tuần tính từ thứ Hai. Không nói rõ tuần nào -> lấy lần gần nhất trong quá khứ.
  m = t.match(/(thứ\s*[2-7]|thứ\s*(hai|ba|tư|năm|sáu|bảy)|chủ\s*nhật|cn)(\s*tuần\s*(này|trước|vừa\s*rồi|rồi))?/);
  if (m) {
    const key = m[1].replace(/\s+/g, " ").trim();
    const weekday = WEEKDAYS[key];
    if (weekday !== undefined) {
      const qualifier = (m[3] || "").replace(/\s+/g, " ").trim();
      const mondayThisWeek = recentWeekday(today, 1);
      const offset = (weekday + 6) % 7; // thứ Hai = 0 ... chủ nhật = 6
      let date: Date;
      if (/trước|vừa\s*rồi|rồi/.test(qualifier)) {
        date = addDays(mondayThisWeek, -7 + offset); // đúng thứ đó của tuần trước
      } else if (/tuần\s*này/.test(qualifier)) {
        date = addDays(mondayThisWeek, offset);
        if (date > today) date = addDays(date, -7); // rơi vào tương lai -> lùi 1 tuần
      } else {
        date = recentWeekday(today, weekday); // lần gần nhất (kể cả hôm nay)
      }
      return { date, matched: m[0].trim() };
    }
  }

  // "cuối tuần trước" -> chủ nhật tuần trước ; "đầu tuần" -> thứ 2 tuần này
  if (/cuối\s*tuần(\s*trước|\s*vừa\s*rồi)?/.test(t)) {
    const mm = t.match(/cuối\s*tuần(\s*trước|\s*vừa\s*rồi)?/)!;
    return { date: addDays(recentWeekday(today, 0), -7), matched: mm[0].trim() };
  }
  if (/đầu\s*tuần(\s*này)?/.test(t)) {
    const mm = t.match(/đầu\s*tuần(\s*này)?/)!;
    const monday = recentWeekday(today, 1);
    return { date: monday, matched: mm[0].trim() };
  }

  // "đầu tháng" / "cuối tháng" / "giữa tháng"
  if (/đầu\s*tháng/.test(t)) {
    const mm = t.match(/đầu\s*tháng/)!;
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    return { date: atNoon(d), matched: mm[0] };
  }
  if (/cuối\s*tháng/.test(t)) {
    const mm = t.match(/cuối\s*tháng/)!;
    const d = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { date: atNoon(d), matched: mm[0] };
  }
  if (/giữa\s*tháng/.test(t)) {
    const mm = t.match(/giữa\s*tháng/)!;
    const d = new Date(today.getFullYear(), today.getMonth(), 15);
    return { date: atNoon(d), matched: mm[0] };
  }

  // "ngày 5 tháng trước" / "mùng 3 tháng này" / "ngày 12 tháng 9"
  m = t.match(/(ngày\s*|mùng\s*|mồng\s*)?(\d{1,2})\s*tháng\s*(trước|này|(\d{1,2}))/);
  if (m) {
    const day = parseInt(m[2], 10);
    if (day >= 1 && day <= 31) {
      let month = today.getMonth();
      const year = today.getFullYear();
      const mod = m[3];
      if (mod === "trước") month -= 1;
      else if (/^\d+$/.test(mod)) month = parseInt(mod, 10) - 1;
      const d = new Date(year, month, day);
      // "tháng này" mà ngày trong tương lai -> hiểu là tháng trước
      if (mod !== "trước" && d > today) d.setMonth(d.getMonth() - 1);
      return { date: atNoon(d), matched: m[0].trim() };
    }
  }

  // "ngày 5" / "mùng 5" (không nói tháng): ngày 5 gần nhất trong quá khứ
  m = t.match(/(ngày|mùng|mồng)\s*(\d{1,2})\b/);
  if (m) {
    const day = parseInt(m[2], 10);
    if (day >= 1 && day <= 31) {
      let d = new Date(today.getFullYear(), today.getMonth(), day);
      if (d > today) d = new Date(today.getFullYear(), today.getMonth() - 1, day);
      return { date: atNoon(d), matched: m[0].trim() };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Gom lại: một câu nói -> { số tiền, ngày }
// ---------------------------------------------------------------------------

export interface VoiceParseResult {
  amount: number | null;
  date: Date;
  /** true nếu người nói có nhắc ngày cụ thể */
  dateExplicit: boolean;
  /** đoạn text đã dùng làm ngày (để debug/hiển thị) */
  dateMatched: string | null;
}

/**
 * Parse trọn một câu nói: tách ngày ra trước, phần còn lại đọc số tiền.
 * Ví dụ: "năm mươi nghìn hôm qua" -> { amount: 50000, date: hôm qua }.
 * Không nhắc ngày -> date = hôm nay, dateExplicit = false.
 */
export function parseVoiceInput(text: string, now: Date = new Date()): VoiceParseResult {
  const t = normalizeLight(text);
  const dateParsed = parseVietnameseDate(t, now);
  // Cắt đoạn ngày đã khớp ra khỏi câu, phần còn lại đọc số tiền.
  // (matched vốn được tách từ text đã normalizeLight nên replace trực tiếp được)
  const rest = dateParsed ? t.replace(dateParsed.matched, " ") : t;
  const amount = parseVietnameseAmount(rest);
  return {
    amount,
    date: dateParsed ? dateParsed.date : atNoon(now),
    dateExplicit: !!dateParsed,
    dateMatched: dateParsed ? dateParsed.matched : null,
  };
}

/** Lệnh thoại điều khiển (đọc từ transcript cuối). */
export type VoiceCommand = "finish" | "save" | null;

export function detectVoiceCommand(text: string): VoiceCommand {
  const t = normalizeText(text);
  if (/(^|\s)(lưu lại|lưu|xong|ok|đồng ý)(\s|$|[.,])/.test(t)) return "save";
  if (/(^|\s)(kết thúc|dừng lại|dừng|thôi|hết)(\s|$|[.,])/.test(t)) return "finish";
  return null;
}
