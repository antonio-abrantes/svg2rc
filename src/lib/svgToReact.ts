import { optimize } from "svgo/browser";

export type OutputFormat = "jsx" | "tsx";

export interface ConvertOptions {
  componentName: string;
  format: OutputFormat;
}

// HTML/SVG attributes that need special JSX names
const ATTR_MAP: Record<string, string> = {
  class: "className",
  "xlink:href": "xlinkHref",
  "xlink:title": "xlinkTitle",
  "xlink:role": "xlinkRole",
  "xlink:arcrole": "xlinkArcrole",
  "xlink:show": "xlinkShow",
  "xlink:actuate": "xlinkActuate",
  "xlink:type": "xlinkType",
  "xml:base": "xmlBase",
  "xml:lang": "xmlLang",
  "xml:space": "xmlSpace",
  tabindex: "tabIndex",
  contenteditable: "contentEditable",
  crossorigin: "crossOrigin",
  autofocus: "autoFocus",
};

const KEEP_LOWERCASE = new Set([
  "d",
  "x",
  "y",
  "z",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x1",
  "y1",
  "x2",
  "y2",
  "dx",
  "dy",
]);

function toCamel(name: string): string {
  if (ATTR_MAP[name]) return ATTR_MAP[name];
  if (name.startsWith("data-") || name.startsWith("aria-")) return name;
  if (name.startsWith("xmlns")) return name;
  if (KEEP_LOWERCASE.has(name)) return name;
  if (!name.includes("-") && !name.includes(":")) return name;
  return name
    .replace(/:/g, "-")
    .split("-")
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join("");
}

function styleStringToObject(styleStr: string): string {
  const entries = styleStr
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((decl) => {
      const idx = decl.indexOf(":");
      if (idx === -1) return null;
      const rawKey = decl.slice(0, idx).trim();
      const value = decl.slice(idx + 1).trim();
      const key = rawKey.startsWith("--")
        ? `"${rawKey}"`
        : rawKey
            .split("-")
            .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
            .join("");
      return `${key}: ${JSON.stringify(value)}`;
    })
    .filter(Boolean);
  return `{{ ${entries.join(", ")} }}`;
}

function escapeAttrValue(value: string): string {
  return `"${value.replace(/"/g, "&quot;")}"`;
}

function serializeNode(node: Node, indent: string, isRoot: boolean, rootOverrides: string[]): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";
    if (!text.trim()) return "";
    const escaped = text.replace(/[{}]/g, (c) => `{'${c}'}`);
    return indent + escaped + "\n";
  }
  if (node.nodeType === Node.COMMENT_NODE) {
    return `${indent}{/*${(node.textContent ?? "").replace(/\*\//g, "*\\/")}*/}\n`;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as Element;
  const tag = el.tagName;
  const attrParts: string[] = [];

  for (const attr of Array.from(el.attributes)) {
    const name = attr.name;
    const value = attr.value;
    if (isRoot && (name === "width" || name === "height" || name === "class" || name === "style")) {
      continue;
    }
    const jsxName = toCamel(name);
    if (name === "style") {
      attrParts.push(`${jsxName}=${styleStringToObject(value)}`);
    } else {
      attrParts.push(`${jsxName}=${escapeAttrValue(value)}`);
    }
  }

  if (isRoot) {
    attrParts.push(...rootOverrides);
  }

  const children = Array.from(el.childNodes);
  const childIndent = indent + "  ";
  const childrenStr = children
    .map((c) => serializeNode(c, childIndent, false, rootOverrides))
    .join("");

  const attrsStr = attrParts.length
    ? attrParts.length <= 2
      ? " " + attrParts.join(" ")
      : "\n" + childIndent + attrParts.join("\n" + childIndent)
    : "";

  if (!childrenStr.trim()) {
    return `${indent}<${tag}${attrsStr} />\n`;
  }
  const openClose = attrParts.length > 2 ? `\n${indent}` : "";
  return `${indent}<${tag}${attrsStr}${openClose}>\n${childrenStr}${indent}</${tag}>\n`;
}

export interface ConversionSuccess {
  ok: true;
  code: string;
  componentName: string;
}
export interface ConversionFailure {
  ok: false;
  error: { key: string; params?: Record<string, string | number> };
}
export type ConversionResult = ConversionSuccess | ConversionFailure;

export function convertSvgToComponent(
  svgSource: string,
  opts: ConvertOptions,
): ConversionResult {
  let optimized: string;
  try {
    const res = optimize(svgSource, {
      multipass: true,
      plugins: [
        {
          name: "preset-default",
          params: {
            overrides: {
              removeViewBox: false,
              removeDimensions: false,
              cleanupIds: false,
              convertShapeToPath: false,
              mergePaths: false,
            },
          },
        },
      ],
    });
    optimized = res.data;
  } catch (e) {
    return {
      ok: false,
      error: {
        key: "validation.optimizeFailed",
        params: { message: (e as Error).message },
      },
    };
  }

  const doc = new DOMParser().parseFromString(optimized, "image/svg+xml");
  if (doc.querySelector("parsererror") || doc.documentElement.tagName.toLowerCase() !== "svg") {
    return { ok: false, error: { key: "validation.optimizeInvalid" } };
  }

  const svgEl = doc.documentElement;

  // Determine dimensions
  let originalWidth = 24;
  let originalHeight = 24;
  const viewBoxAttr = svgEl.getAttribute("viewBox");
  const widthAttr = svgEl.getAttribute("width");
  const heightAttr = svgEl.getAttribute("height");

  if (viewBoxAttr) {
    const parts = viewBoxAttr.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
      originalWidth = parts[2];
      originalHeight = parts[3];
    }
  } else if (widthAttr && heightAttr) {
    const w = parseFloat(widthAttr);
    const h = parseFloat(heightAttr);
    if (!Number.isNaN(w)) originalWidth = w;
    if (!Number.isNaN(h)) originalHeight = h;
    svgEl.setAttribute("viewBox", `0 0 ${originalWidth} ${originalHeight}`);
  } else {
    svgEl.setAttribute("viewBox", `0 0 24 24`);
  }

  const aspect = originalHeight / originalWidth;
  const heightExpr = aspect === 1 ? `{size}` : `{size * ${aspect}}`;

  const rootOverrides = [
    `width={size}`,
    `height=${heightExpr}`,
    `className={className}`,
    `style={style}`,
    `{...props}`,
  ];

  const jsxTree = serializeNode(svgEl, "  ", true, rootOverrides).trimEnd();

  const { componentName, format } = opts;
  const isTS = format === "tsx";

  if (isTS) {
    return {
      ok: true,
      componentName,
      code: `import React, { SVGProps } from 'react';

interface ${componentName}Props extends SVGProps<SVGSVGElement> {
  size?: number;
}

const ${componentName} = ({ size = ${originalWidth}, className = '', style = {}, ...props }: ${componentName}Props) => (
${jsxTree}
);

export default ${componentName};
`,
    };
  }

  return {
    ok: true,
    componentName,
    code: `import React from 'react';

const ${componentName} = ({ size = ${originalWidth}, className = '', style = {}, ...props }) => (
${jsxTree}
);

export default ${componentName};
`,
  };
}
