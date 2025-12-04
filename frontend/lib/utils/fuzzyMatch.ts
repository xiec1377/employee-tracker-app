/**
 * Calculates the Levenshtein distance between two strings
 * This measures how many single-character edits are needed to change one string into another
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Normalizes a string for fuzzy matching by:
 * - Converting to lowercase
 * - Removing extra whitespace
 * - Removing special characters (optional)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Checks if all characters of the search term appear in order in the target string
 * This allows for partial matches like "jhn" matching "john"
 */
function hasOrderedChars(searchTerm: string, target: string): boolean {
  const search = normalizeString(searchTerm);
  const targetNormalized = normalizeString(target);
  let searchIndex = 0;

  for (let i = 0; i < targetNormalized.length && searchIndex < search.length; i++) {
    if (targetNormalized[i] === search[searchIndex]) {
      searchIndex++;
    }
  }

  return searchIndex === search.length;
}

/**
 * Calculates a fuzzy match score between 0 and 1
 * Higher score means better match
 */
export function fuzzyMatchScore(searchTerm: string, target: string): number {
  if (!searchTerm || !target) return 0;

  const normalizedSearch = normalizeString(searchTerm);
  const normalizedTarget = normalizeString(target);

  // Exact match (case-insensitive)
  if (normalizedTarget === normalizedSearch) {
    return 1.0;
  }

  // Starts with search term
  if (normalizedTarget.startsWith(normalizedSearch)) {
    return 0.9;
  }

  // Contains search term
  if (normalizedTarget.includes(normalizedSearch)) {
    return 0.8;
  }

  // Check if all characters appear in order
  if (hasOrderedChars(normalizedSearch, normalizedTarget)) {
    const distance = levenshteinDistance(normalizedSearch, normalizedTarget);
    const maxLength = Math.max(normalizedSearch.length, normalizedTarget.length);
    // Score based on how similar the strings are
    return Math.max(0, 1 - distance / maxLength) * 0.6;
  }

  // Calculate similarity using Levenshtein distance
  const distance = levenshteinDistance(normalizedSearch, normalizedTarget);
  const maxLength = Math.max(normalizedSearch.length, normalizedTarget.length);
  const similarity = 1 - distance / maxLength;

  // Only return a score if similarity is above threshold (0.3)
  return similarity > 0.3 ? similarity * 0.5 : 0;
}

/**
 * Checks if a search term fuzzy matches any field in an object
 * Returns the best match score across all searchable fields
 */
export function fuzzyMatchObject<T>(
  searchTerm: string,
  obj: T,
  searchableFields: (keyof T)[]
): number {
  if (!searchTerm) return 1;

  let bestScore = 0;

  for (const field of searchableFields) {
    const value = obj[field];
    if (value === null || value === undefined) continue;

    const stringValue = String(value);
    const score = fuzzyMatchScore(searchTerm, stringValue);
    bestScore = Math.max(bestScore, score);
  }

  return bestScore;
}

/**
 * Splits search term into individual words and checks if they all match
 * This allows multi-word searches like "john engineering" to match
 * employees named John in the Engineering department
 */
export function fuzzyMatchMultiWord<T>(
  searchTerm: string,
  obj: T,
  searchableFields: (keyof T)[]
): number {
  const words = normalizeString(searchTerm).split(/\s+/).filter(Boolean);
  
  if (words.length === 0) return 1;
  if (words.length === 1) {
    return fuzzyMatchObject(words[0], obj, searchableFields);
  }

  // For multi-word searches, calculate average score of all words
  let totalScore = 0;
  for (const word of words) {
    const wordScore = fuzzyMatchObject(word, obj, searchableFields);
    totalScore += wordScore;
  }

  return totalScore / words.length;
}

