export function toPascalCase(raw: string, fallback = "MyIcon"): string {
  if (!raw) return fallback;
  // Normalize accents (á -> a)
  const normalized = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cleaned = normalized
    // split camelCase / PascalCase transitions into words too
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  const result = cleaned || fallback;
  return /^[0-9]/.test(result) ? `Icon${result}` : result;
}

export function generateComponentName(svgDoc: Document | null, fallback = "MyIcon"): string {
  const title = svgDoc?.querySelector("title")?.textContent?.trim();
  return toPascalCase(title || fallback, fallback);
}

