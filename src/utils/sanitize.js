import DOMPurify from 'dompurify';

/** Tags allowed in rich-text fields edited by the practitioner. */
const ALLOWED_TAGS = ['em', 'strong', 'b', 'i', 'br', 'p', 'ul', 'ol', 'li', 'a'];
const ALLOWED_ATTR = ['href', 'target', 'rel'];

/**
 * Removes scripts, event handlers and any non-allowed markup from an HTML
 * string. Second line of defence: the API already sanitises on write.
 * @param {string | null | undefined} html
 * @returns {string}
 */
export function sanitize(html) {
  return DOMPurify.sanitize(html ?? '', { ALLOWED_TAGS, ALLOWED_ATTR });
}
