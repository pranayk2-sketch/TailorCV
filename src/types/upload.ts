export interface UploadedResume {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  parsed_text: string | null;
  parsed_json: Record<string, unknown>;
  created_at: string;
}
