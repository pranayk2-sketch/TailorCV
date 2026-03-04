/**
 * Deterministic relevance scoring and fingerprinting (no AI).
 */

const TECH_KEYWORDS = [
  'react', 'typescript', 'javascript', 'python', 'java', 'c++', 'go', 'rust', 'kotlin', 'swift',
  'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'postgres', 'mysql', 'mongodb',
  'redis', 'graphql', 'rest', 'api', 'sql', 'nosql', 'machine learning', 'ml', 'ai',
  'pytorch', 'tensorflow', 'scikit', 'pandas', 'numpy', 'tableau', 'analytics', 'data',
  'product', 'roadmap', 'agile', 'scrum', 'ci/cd', 'jenkins', 'github', 'git',
  'node', 'nodejs', 'express', 'django', 'flask', 'fastapi', 'spring', 'nextjs',
  'html', 'css', 'frontend', 'backend', 'fullstack', 'full-stack',
];

const EEO_PATTERNS = [
  /equal\s+opportunity\s+employer/i,
  /eeo\s+compliant/i,
  /affirmative\s+action/i,
  /we\s+are\s+an?\s+equal\s+opportunity/i,
  /all\s+qualified\s+applicants/i,
  /without\s+regard\s+to\s+race/i,
  /diversity\s+and\s+inclusion\s+statement/i,
  /reasonable\s+accommodation/i,
  /ada\s+compliant/i,
];

/**
 * Extract keywords from text using TECH_KEYWORDS + frequency-based nouns.
 * Returns top ~12 keywords (lowercased).
 */
export function extractKeywords(text) {
  if (!text || typeof text !== 'string') return [];
  const lower = text.toLowerCase();
  const found = new Set();

  for (const kw of TECH_KEYWORDS) {
    if (lower.includes(kw)) found.add(kw);
  }

  // Simple noun extraction: words 4+ chars that appear multiple times
  const words = lower.match(/\b[a-z]{4,}\b/g) || [];
  const freq = {};
  for (const w of words) {
    if (TECH_KEYWORDS.some((k) => k.includes(w) || w.includes(k))) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  const sorted = Object.entries(freq)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);
  for (const w of sorted) found.add(w);

  return Array.from(found).slice(0, 12);
}

/**
 * Classify role_family from keywords.
 */
export function classifyRoleFamily(keywords) {
  const k = keywords.map((x) => x.toLowerCase());
  if (k.some((x) => ['pytorch', 'tensorflow', 'ml', 'machine learning'].includes(x))) return 'ml';
  if (k.some((x) => ['sql', 'tableau', 'analytics', 'data'].includes(x))) return 'data';
  if (k.some((x) => ['product', 'roadmap', 'pm'].includes(x))) return 'pm';
  return 'swe';
}

/**
 * Compute fingerprint: role_family + '|' + top 5 keywords (sorted, lowercased).
 */
export function computeFingerprint(roleFamily, keywords) {
  const top = keywords
    .slice(0, 5)
    .map((k) => k.toLowerCase())
    .sort();
  return `${roleFamily}|${top.join(',')}`;
}

/**
 * Build user profile tokens from skills + bullet text.
 */
export function buildUserTokens(skills, bullets) {
  const tokens = new Set();
  for (const s of skills || []) {
    if (s.name) tokens.add(s.name.toLowerCase().trim());
  }
  const bulletText = (bullets || []).join(' ').toLowerCase();
  const words = bulletText.match(/\b[a-z0-9+]{2,}\b/g) || [];
  for (const w of words) tokens.add(w);
  return Array.from(tokens);
}

/**
 * Compute relevance score (0-100) and breakdown.
 */
export function computeRelevanceScore(jobKeywords, userTokens) {
  const jobSet = new Set(jobKeywords.map((k) => k.toLowerCase()));
  const userSet = new Set(userTokens.map((t) => t.toLowerCase()));

  const matched = [];
  const missing = [];
  for (const j of jobSet) {
    const found = Array.from(userSet).some((u) => u.includes(j) || j.includes(u));
    if (found) matched.push(j);
    else missing.push(j);
  }

  const matchedFromSkills = matched.filter((m) =>
    userTokens.some((u) => u.toLowerCase().includes(m.toLowerCase())),
  );
  const matchedFromBullets = matched.filter((m) => !matchedFromSkills.includes(m));

  const score = jobSet.size > 0 ? Math.round((matched.length / jobSet.size) * 100) : 0;
  return {
    score: Math.min(100, score),
    matchedSkills: matchedFromSkills,
    matchedFromBullets,
    missingKeywords: missing.slice(0, 10),
  };
}
