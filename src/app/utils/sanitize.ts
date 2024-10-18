// src/utils/sanitize.ts

import DOMPurify from 'dompurify';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

export function getSanitizedUrlParam(param: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const rawValue = urlParams.get(param);
  return rawValue ? sanitizeInput(rawValue) : null;
}
