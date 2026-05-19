import { env } from '../config/env.js';

function normalizeRule(category, terms) {
  const normalizedTerms = Array.isArray(terms) ? terms : String(terms).split('|');

  return {
    category: String(category).trim(),
    terms: normalizedTerms.map((term) => String(term).trim().toLowerCase()).filter(Boolean)
  };
}

export function parseCategoryRules(rawRules = env.CATEGORY_RULES) {
  if (!rawRules.trim()) return [];

  try {
    const parsed = JSON.parse(rawRules);

    if (Array.isArray(parsed)) {
      return parsed
        .map((rule) => normalizeRule(rule.category, rule.terms ?? rule.keywords ?? []))
        .filter((rule) => rule.category && rule.terms.length > 0);
    }

    return Object.entries(parsed)
      .map(([category, terms]) => normalizeRule(category, terms))
      .filter((rule) => rule.category && rule.terms.length > 0);
  } catch {
    return rawRules
      .split(';')
      .map((entry) => {
        const [category, terms = ''] = entry.split(':');
        return normalizeRule(category, terms);
      })
      .filter((rule) => rule.category && rule.terms.length > 0);
  }
}

export function resolveCategory(title, rules = parseCategoryRules()) {
  const normalizedTitle = String(title ?? '').toLowerCase();
  const match = rules.find((rule) => rule.terms.some((term) => normalizedTitle.includes(term)));

  return match?.category ?? env.DEFAULT_CATEGORY;
}
