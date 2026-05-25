
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
  const parsed = lines.slice(1)
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

export function formatDate(date, zoom) {
  const d = date instanceof Date ? date : parseDateSafe(date);
  if (zoom === "year") return d.getFullYear();
  if (zoom === "month")
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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