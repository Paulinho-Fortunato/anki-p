/**
 * FTS5 query sanitization
 *
 * SQLite FTS5 MATCH expressions have their own syntax ("NOT", "AND", "*",
 * quotes, parentheses...). Passing raw user input like `C++` or `Lavoisier -`
 * throws `fts5: syntax error`. This module converts arbitrary user text into a
 * safe FTS5 phrase query, and provides a LIKE-based fallback for tokens that
 * contain characters stripped by the unicode61 tokenizer (e.g. "C++").
 */

const FTS_SPECIAL_CHARS = /["*(){}^$:]/g;
const FTS_KEYWORDS = /\b(AND|OR|NOT|NEAR)\b/gi;

/** Escapes/normalizes a single user token into a safe FTS term. */
export function sanitizeFtsToken(token: string): string {
  return token.replace(FTS_SPECIAL_CHARS, '').trim();
}

/**
 * Builds a safe FTS5 MATCH expression from free-form user input.
 * Each word becomes a quoted prefix-searchable phrase; words are ANDed.
 * Returns '' when nothing searchable remains.
 */
export function buildFtsQuery(query: string): string {
  const tokens = query
    .replace(FTS_KEYWORDS, ' ')
    .split(/\s+/)
    .map(sanitizeFtsToken)
    .filter(t => t.length > 0);

  if (tokens.length === 0) return '';

  return tokens.map(t => `"${t}"`).join(' AND ');
}

/** Extracts sanitized word tokens (for LIKE fallback). */
export function extractSearchTokens(query: string): string[] {
  return query
    .replace(FTS_SPECIAL_CHARS, ' ')
    .replace(FTS_KEYWORDS, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);
}

/** Escapes LIKE wildcards so user text is matched literally. */
export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, '\\$&');
}

/**
 * Checks whether any token would be dropped entirely by the FTS unicode61
 * tokenizer (no alphanumeric chars left), which makes FTS match nothing even
 * though a LIKE search could find results (e.g. "C++").
 */
export function needsLikeFallback(query: string): boolean {
  return extractSearchTokens(query).some(t => !/[A-Za-z0-9\u00C0-\u017F]/.test(t));
}
