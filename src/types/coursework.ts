export interface Coursework {
  id: string;
  user_id: string;
  course_code: string;
  course_name: string;
  category: string | null;
  sort_order: number;
  created_at: string;
}

export type CourseworkInsert = Pick<Coursework, 'course_code' | 'course_name'> &
  Partial<Pick<Coursework, 'category' | 'sort_order'>>;
