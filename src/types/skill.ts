export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  proficiency: number | null;
  keywords: string[];
  sort_order: number;
  created_at: string;
}

export type SkillInsert = Pick<Skill, 'name'> &
  Partial<Pick<Skill, 'category' | 'proficiency' | 'keywords' | 'sort_order'>>;
