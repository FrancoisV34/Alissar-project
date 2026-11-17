import sanitizeHtml from 'sanitize-html';

/**
 * Tags the practitioner may use in rich-text fields (hero title, about text,
 * FAQ answers). Everything else — scripts, event handlers, iframes, styles —
 * is stripped before the value is stored.
 */
const RICH_TEXT_OPTIONS = {
  allowedTags: ['em', 'strong', 'b', 'i', 'br', 'p', 'ul', 'ol', 'li', 'a'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

/**
 * Removes any dangerous markup from a rich-text value.
 * @param {string | null | undefined} html
 * @returns {string | null | undefined}
 */
export function sanitizeRichText(html) {
  if (typeof html !== 'string') return html;
  return sanitizeHtml(html, RICH_TEXT_OPTIONS);
}
