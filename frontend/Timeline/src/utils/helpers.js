export function parseDateSafe(d) {
  if (d instanceof Date) return d;
  const s = String(d).trim();
  if (s.includes("T")) return new Date(s);
  return new Date(s + "T00:00:00");
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
        description: obj.description || "No description provided.",
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

  if (fmt === "YYYY")          return String(d.getFullYear());
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