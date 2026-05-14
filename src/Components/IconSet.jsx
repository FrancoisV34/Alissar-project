export const Icon = {
  Calendar: (p) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...p}>
      <rect x="3" y="4" width="14" height="13" rx="2" />
      <path d="M3 8h14" />
      <path d="M7 2v4M13 2v4" />
    </svg>
  ),
  Phone: (p) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 3h3l1.5 4-2 1a8 8 0 0 0 4.5 4.5l1-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5C9 16 4 11 3.5 4.6A1.5 1.5 0 0 1 5 3Z" />
    </svg>
  ),
  Pin: (p) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M10 18s-6-5-6-10a6 6 0 1 1 12 0c0 5-6 10-6 10Z" />
      <circle cx="10" cy="8" r="2" />
    </svg>
  ),
  Clock: (p) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...p}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l2.5 2" />
    </svg>
  ),
  Star: (p) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...p}>
      <path d="M10 2l2.4 5 5.6.5-4.2 3.8 1.3 5.4L10 13.8 4.9 16.7l1.3-5.4L2 7.5 7.6 7Z" />
    </svg>
  ),
  Sparkle: (p) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...p}>
      <path d="M10 3v4M10 13v4M3 10h4M13 10h4M5.5 5.5l2 2M12.5 12.5l2 2M14.5 5.5l-2 2M7.5 12.5l-2 2" />
    </svg>
  ),
  Heart: (p) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" {...p}>
      <path d="M10 16s-5.5-3.4-5.5-7.5A3 3 0 0 1 10 6.5 3 3 0 0 1 15.5 8.5C15.5 12.6 10 16 10 16Z" />
    </svg>
  ),
  Arrow: (p) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 7h8M7 3l4 4-4 4" />
    </svg>
  ),
  Menu: (p) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...p}>
      <path d="M3 6h12M3 12h12" />
    </svg>
  ),
  Sun: (p) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...p}>
      <circle cx="9" cy="9" r="3" />
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.5 3.5l1.5 1.5M13 13l1.5 1.5M3.5 14.5l1.5-1.5M13 5l1.5-1.5" />
    </svg>
  ),
  Moon: (p) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" {...p}>
      <path d="M14.5 11.5A6 6 0 1 1 6.5 3.5a5 5 0 0 0 8 8Z" />
    </svg>
  ),
  Globe: (p) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <circle cx="10" cy="10" r="7" />
      <path d="M3 10h14M10 3a11 11 0 0 1 0 14M10 3a11 11 0 0 0 0 14" />
    </svg>
  ),
};

export const ICON_KEYS = Object.keys(Icon);
