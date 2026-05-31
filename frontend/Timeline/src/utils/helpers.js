export function parseDateSafe(d) {
  if (d instanceof Date) return d;
  const s = String(d).trim();
  if (!s || s === "undefined" || s === "null") return new Date(NaN);

  if (s.includes("T")) return new Date(s);

  const ddmmyyyy = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
  }

  const ddmmyyyySlash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyySlash) {
    const [, day, month, year] = ddmmyyyySlash;
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
  }

  const ddmmyyyyDot = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (ddmmyyyyDot) {
    const [, day, month, year] = ddmmyyyyDot;
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
  }

  const yyyymmdd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
  }

  const yyyymmddSlash = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (yyyymmddSlash) {
    const [, year, month, day] = yyyymmddSlash;
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
  }

  const mmddyyyy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyy) {
    const [, month, day, year] = mmddyyyy;
    if (Number(day) > 12) {
      return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
    }
  }

  const ddMonYYYY = s.match(/^(\d{1,2})[-\/\s]([A-Za-z]+)[-\/\s](\d{4})$/);
  if (ddMonYYYY) {
    const [, day, mon, year] = ddMonYYYY;
    const parsed = new Date(`${mon} ${day}, ${year}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  const monDDYYYY = s.match(/^([A-Za-z]+)[-\/\s](\d{1,2})[-\/\s](\d{4})$/);
  if (monDDYYYY) {
    const [, mon, day, year] = monDDYYYY;
    const parsed = new Date(`${mon} ${day}, ${year}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  const monYYYY = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monYYYY) {
    const [, mon, year] = monYYYY;
    const parsed = new Date(`${mon} 1, ${year}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  const yyyyMon = s.match(/^(\d{4})[-\/\s]([A-Za-z]+)$/);
  if (yyyyMon) {
    const [, year, mon] = yyyyMon;
    const parsed = new Date(`${mon} 1, ${year}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  const yyyyOnly = s.match(/^(\d{4})$/);
  if (yyyyOnly) {
    return new Date(`${s}-01-01T00:00:00`);
  }

  if (/^\d{10,13}$/.test(s)) {
    const ts = Number(s);
    return new Date(s.length === 13 ? ts : ts * 1000);
  }

  const fallback = new Date(s);
  return fallback;
}

export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV must contain header + rows");
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const parsed = lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line, rowIndex) => {
      const values = line.split(",");
      const obj = {};
      headers.forEach((h, i) => { obj[h] = values[i]?.trim() || ""; });
      return {
        ...obj,
        _eid: `csv_0_${rowIndex}`,
        title: obj.name || obj.title || "Untitled",
        date: parseDateSafe(obj.date),
        description: obj.description || obj.discription || obj.desc || obj.details || obj.detail || obj.note || obj.notes || "No description provided.",
      };
    });
  return parsed.sort((a, b) => parseDateSafe(a.date) - parseDateSafe(b.date));
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
        _eid:        `csv_mapped_${index}`,
        title:       title.trim(),
        name:        title.trim(),
        date:        parseDateSafe(rawDate),
        description: description.trim(),
      };
    })
    .sort((a, b) => parseDateSafe(a.date) - parseDateSafe(b.date));
}

export function formatDate(date, zoom, fmt) {
  const d = date instanceof Date ? date : parseDateSafe(date);

  if (fmt === "YYYY")        return String(d.getFullYear());
  if (fmt === "MON-YYYY")
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  if (fmt === "DD-MON-YYYY") {
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
    if (!ev.title?.trim()) {
      errors.push(`Row ${i + 1}: Missing title/name`);
      return;
    }
    const d = parseDateSafe(ev.date);
    if (isNaN(d.getTime())) {
      errors.push(`Row ${i + 1}: Invalid date "${ev.date}"`);
      return;
    }
    valid.push(ev);
  });
  return { valid, errors };
}