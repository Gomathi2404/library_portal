/**
 * Parse a CSV string into an array of objects.
 * First row is treated as headers.
 */
export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g,""));
  const rows    = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = [];
    let current  = "";
    let inQuotes = false;

    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());

    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] !== undefined ? values[idx] : "";
    });
    rows.push(obj);
  }
  return rows;
}

export function downloadCSVTemplate(filename, headers, sampleRow) {
  const headerLine = headers.join(",");
  const sampleLine = headers.map(h => sampleRow[h] || "").join(",");
  const csv        = headerLine + "\n" + sampleLine;
  const blob       = new Blob([csv], { type:"text/csv;charset=utf-8;" });
  const url        = URL.createObjectURL(blob);
  const a          = document.createElement("a");
  a.href           = url;
  a.download       = filename;
  a.click();
  URL.revokeObjectURL(url);
}