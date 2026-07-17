export type AppMessage = {
  key: string;
  params?: Record<string, string | number>;
};

export interface ValidationResult {
  ok: boolean;
  error?: AppMessage;
  doc?: Document;
  sanitized?: string;
}

export function validateSvg(input: string): ValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: { key: "validation.empty" } };
  }
  if (!/<svg[\s>]/i.test(trimmed)) {
    return { ok: false, error: { key: "validation.noSvgTag" } };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(trimmed, "image/svg+xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    const message =
      parseError.textContent?.replace(/\s+/g, " ").trim().slice(0, 200) ?? "malformed";
    return { ok: false, error: { key: "validation.invalid", params: { message } } };
  }

  const root = doc.documentElement;
  if (!root || root.tagName.toLowerCase() !== "svg") {
    return { ok: false, error: { key: "validation.rootNotSvg" } };
  }

  root.querySelectorAll("script").forEach((n) => n.remove());
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node: Node | null = walker.currentNode;
  const toStrip: Element[] = [];
  while (node) {
    if (node.nodeType === 1) toStrip.push(node as Element);
    node = walker.nextNode();
  }
  toStrip.forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
    }
  });

  const sanitized = new XMLSerializer().serializeToString(root);
  return { ok: true, doc, sanitized };
}
