export interface ResumeVariant {
  id: string;
  user_id: string;
  role_family: string;
  fingerprint: string;
  keywords: string[];
  plan_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface VariantMapResult {
  variantId: string;
  roleFamily: string;
  fingerprint: string;
  score: number;
  breakdown: {
    matchedSkills: string[];
    matchedFromBullets: string[];
    missingKeywords: string[];
  };
  keywords: string[];
}
