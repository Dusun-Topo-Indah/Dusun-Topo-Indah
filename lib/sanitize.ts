import sanitize from "sanitize-html";

export function sanitizeHtml(dirty: string): string {
  return sanitize(dirty, {
    allowedTags: [
      "b", "i", "em", "strong", "a", "p", "br",
      "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "span", "img"
    ],
    allowedAttributes: {
      "*": ["class"],
      "a": ["href", "target", "rel"],
      "img": ["src", "alt", "width", "height"]
    },
  });
}
