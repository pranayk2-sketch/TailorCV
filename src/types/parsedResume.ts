/** Output format from the deterministic resume parser */

export interface ParsedProfile {
  full_name: string;
  headline: string;
  email: string;
}

export interface ParsedSkill {
  name: string;
  category: string;
}

export interface ParsedCoursework {
  course_code: string;
  course_name: string;
}

export interface ParsedExperience {
  type: 'work' | 'project' | 'leadership' | 'education' | 'award' | 'publication';
  org: string;
  role_title: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  bullets: string[];
  metadata?: { raw_block?: string };
}

export interface ParsedResume {
  profile: ParsedProfile;
  skills: ParsedSkill[];
  coursework: ParsedCoursework[];
  experiences: ParsedExperience[];
  _meta?: { raw_text_preview?: string; parsed_at?: string };
}
