const CONSENT_KEY = 'mb-consent';

export function getConsent() {
  if (typeof localStorage === 'undefined') return 'unset';
  return localStorage.getItem(CONSENT_KEY) ?? 'unset';
}

export function setConsent(value) {
  localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent('mb-consent-change', { detail: value }));
}
