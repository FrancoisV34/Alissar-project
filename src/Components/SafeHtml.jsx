import { sanitize } from '../utils/sanitize.js';

/**
 * Renders rich text coming from the admin (e.g. `L'ostéopathie, <em>à votre rythme</em>`)
 * after sanitising it.
 * @param {{ html?: string | null } & React.HTMLAttributes<HTMLSpanElement>} props
 */
export default function SafeHtml({ html, ...rest }) {
  return <span {...rest} dangerouslySetInnerHTML={{ __html: sanitize(html) }} />;
}
