export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV must contain header + rows");
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i]?.trim() || ""; });
    return {
      ...obj,
      title: obj.name || obj.title,
      date: new Date(obj.date),
      description: obj.description || "No description provided.",
    };
  });
}

export function formatDate(date, zoom) {
  const d = new Date(date);
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
  const groups = {};
  events.forEach((ev) => {
    const year = new Date(ev.date).getFullYear();
    if (!groups[year]) groups[year] = [];
    groups[year].push(ev);
  });
  return groups;
}