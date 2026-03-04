export interface GeneratedResume {
  id: string;
  user_id: string;
  internship_id: string | null;
  title: string;
  latex_source: string;
  pdf_path: string | null;
  created_at: string;
}
