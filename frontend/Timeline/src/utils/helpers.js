export function parseDateSafe(d) {
  if (d instanceof Date) return isNaN(d.getTime()) ? new Date(NaN) : d;

  const s = String(d).trim();
  if (!s || s === "undefined" || s === "null" || s === "Invalid Date") return new Date(NaN);

  if (s.includes("T")) return new Date(s);

  const ddmmyyyy =
    s.match(/^(\d{1,2})[-](\d{1,2})[-](\d{4})$/) ||
    s.match(/^(\d{1,2})[\/](\d{1,2})[\/](\d{4})$/) ||
    s.match(/^(\d{1,2})[.](\d{1,2})[.](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const dt = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
    if (!isNaN(dt.getTime())) return dt;
  }

  const yyyymmdd =
    s.match(/^(\d{4})[-](\d{1,2})[-](\d{1,2})$/) ||
    s.match(/^(\d{4})[\/](\d{1,2})[\/](\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    const dt = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
    if (!isNaN(dt.getTime())) return dt;
  }

  const mmddyyyy = s.match(/^(\d{1,2})[\/](\d{1,2})[\/](\d{4})$/);
  if (mmddyyyy) {
    const [, month, day, year] = mmddyyyy;
    if (Number(day) > 12) {
      const dt = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
      if (!isNaN(dt.getTime())) return dt;
    }
  }

  const ddMonYYYY = s.match(/^(\d{1,2})[-\/\s]([A-Za-z]{3,9})[-\/\s](\d{4})$/);
  if (ddMonYYYY) {
    const [, day, mon, year] = ddMonYYYY;
    const dt = new Date(`${mon} ${day}, ${year}`);
    if (!isNaN(dt.getTime())) return dt;
  }

  const monDDYYYY = s.match(/^([A-Za-z]{3,9})[-\/\s](\d{1,2})[-\/\s](\d{4})$/);
  if (monDDYYYY) {
    const [, mon, day, year] = monDDYYYY;
    const dt = new Date(`${mon} ${day}, ${year}`);
    if (!isNaN(dt.getTime())) return dt;
  }

  const monYYYY = s.match(/^([A-Za-z]{3,9})\s+(\d{4})$/);
  if (monYYYY) {
    const [, mon, year] = monYYYY;
    const dt = new Date(`${mon} 1, ${year}`);
    if (!isNaN(dt.getTime())) return dt;
  }

  const yyyyMon = s.match(/^(\d{4})[-\/\s]([A-Za-z]{3,9})$/);
  if (yyyyMon) {
    const [, year, mon] = yyyyMon;
    const dt = new Date(`${mon} 1, ${year}`);
    if (!isNaN(dt.getTime())) return dt;
  }

  const yyyyOnly = s.match(/^(\d{4})$/);
  if (yyyyOnly) return new Date(`${s}-01-01T00:00:00`);

  if (/^\d{10,13}$/.test(s)) {
    const ts = Number(s);
    return new Date(s.length === 13 ? ts : ts * 1000);
  }

  if (/[A-Za-z]/.test(s) || s.split(/[-\/.]/).length >= 3) {
    const fallback = new Date(s);
    if (!isNaN(fallback.getTime())) return fallback;
  }

  return new Date(NaN);
}

export function detectDatePrecision(rawStr) {
  const s = String(rawStr).trim();
  if (!s) return "day";
  if (/^\d{4}$/.test(s)) return "year";
  if (/^[A-Za-z]{3,9}\s+\d{4}$/.test(s)) return "month";
  if (/^\d{4}[-\/\s][A-Za-z]{3,9}$/.test(s)) return "month";
  return "day";
}

export function formatDateDisplay(date, precision, fmt) {
  const d = date instanceof Date ? date : parseDateSafe(date);
  if (isNaN(d.getTime())) return "—";

  if (fmt === "YYYY") return String(d.getFullYear());

  if (fmt === "MON-YYYY") {
    if (precision === "year") return String(d.getFullYear());
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  }

  if (fmt === "DD-MON-YYYY") {
    if (precision === "month")
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    if (precision === "year")
      return String(d.getFullYear());
    const day = String(d.getDate()).padStart(2, "0");
    const mon = d.toLocaleDateString("en-US", { month: "short" });
    return `${day}-${mon}-${d.getFullYear()}`;
  }

  if (precision === "year")  return String(d.getFullYear());
  if (precision === "month") return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function parseCSV(text) {
  const rawLines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const lines = rawLines.filter((line) => line.replace(/,/g, "").trim() !== "");
  if (lines.length < 2) throw new Error("CSV must contain header + rows");

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  const parsed = lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line, rowIndex) => {
      const values = splitCSVLine(line);
      const obj = {};
      headers.forEach((h, i) => { obj[h] = values[i]?.trim() || ""; });

      const rawDate = obj.date || obj.time || obj.when || obj.timestamp || obj.day || "";
      const parsedDate = parseDateSafe(rawDate);

      return {
        ...obj,
        _eid: `csv_0_${rowIndex}`,
        _rawDate: rawDate,
        _datePrecision: detectDatePrecision(rawDate),
        title: obj.name || obj.title || "Untitled",
        date: parsedDate,
        description:
          obj.description || obj.discription || obj.desc ||
          obj.details || obj.detail || obj.note || obj.notes ||
          "No description provided.",
      };
    });

  return parsed.sort((a, b) => parseDateSafe(a.date) - parseDateSafe(b.date));
}

function splitCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function applyColumnMapping(rawRows, mapping) {
  return rawRows
    .filter((row) => {
      const nameVal = mapping.name ? row[mapping.name] : "";
      const dateVal = mapping.date ? row[mapping.date] : "";
      return nameVal?.trim() && dateVal?.trim();
    })
    .map((row, index) => {
      const title       = (mapping.name        ? row[mapping.name]        : "") || "Untitled";
      const rawDate     = (mapping.date        ? row[mapping.date]        : "") || "";
      const description = (mapping.description ? row[mapping.description] : "") || "No description provided.";
      return {
        ...row,
        _eid:           `csv_mapped_${index}`,
        _rawDate:       rawDate,
        _datePrecision: detectDatePrecision(rawDate),
        title:          title.trim(),
        name:           title.trim(),
        date:           parseDateSafe(rawDate),
        description:    description.trim(),
      };
    })
    .sort((a, b) => parseDateSafe(a.date) - parseDateSafe(b.date));
}

export function formatDate(date, zoom, fmt, precision) {
  const d = date instanceof Date ? date : parseDateSafe(date);

  if (fmt === "YYYY") return String(d.getFullYear());

  if (fmt === "MON-YYYY") {
    if (precision === "year") return String(d.getFullYear());
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  }

  if (fmt === "DD-MON-YYYY") {
    if (precision === "month")
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    if (precision === "year")
      return String(d.getFullYear());
    const day = String(d.getDate()).padStart(2, "0");
    const mon = d.toLocaleDateString("en-US", { month: "short" });
    const yr  = d.getFullYear();
    return `${day}-${mon}-${yr}`;
  }

  if (zoom === "year")  return String(d.getFullYear());
  if (zoom === "month") return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function groupEventsByYear(events) {
  const sorted = [...events].sort((a, b) => parseDateSafe(a.date) - parseDateSafe(b.date));
  const groups = {};
  sorted.forEach((ev) => {
    const year = parseDateSafe(ev.date).getFullYear();
    if (!groups[year]) groups[year] = [];
    groups[year].push(ev);
  });
  return groups;
}

export function groupEventsByMonth(events) {
  const sorted = [...events].sort((a, b) => parseDateSafe(a.date) - parseDateSafe(b.date));
  const groups = {};
  sorted.forEach((ev) => {
    const d = parseDateSafe(ev.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(ev);
  });
  return groups;
}

export function groupEventsByDay(events) {
  const sorted = [...events].sort((a, b) => parseDateSafe(a.date) - parseDateSafe(b.date));
  const groups = {};
  sorted.forEach((ev) => {
    const d = parseDateSafe(ev.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(ev);
  });
  return groups;
}

export function validateCSVEvents(events) {
  const valid = [];
  const errors = [];
  events.forEach((ev, i) => {
    if (!ev.title?.trim()) { errors.push(`Row ${i + 1}: Missing title/name`); return; }
    const d = parseDateSafe(ev.date);
    if (isNaN(d.getTime())) { errors.push(`Row ${i + 1}: Invalid date "${ev.date}"`); return; }
    valid.push(ev);
  });
  return { valid, errors };
}