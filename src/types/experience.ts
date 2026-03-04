export type ExperienceType =
  | 'work'
  | 'project'
  | 'leadership'
  | 'education'
  | 'award'
  | 'publication';

export interface Experience {
  id: string;
  user_id: string;
  type: ExperienceType;
  org: string;
  role_title: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ExperienceBullet {
  id: string;
  experience_id: string;
  bullet: string;
  tags: string[];
  sort_order: number;
  created_at: string;
}

export type ExperienceInsert = Pick<
  Experience,
  'type' | 'org' | 'role_title'
> &
  Partial<Pick<Experience, 'location' | 'start_date' | 'end_date' | 'is_current' | 'sort_order' | 'metadata'>>;

export type BulletInsert = Pick<ExperienceBullet, 'experience_id' | 'bullet'> &
  Partial<Pick<ExperienceBullet, 'tags' | 'sort_order'>>;
