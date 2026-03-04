export type SavedStatus = 'saved' | 'applied' | 'interviewing' | 'rejected' | 'offer';

export interface SavedInternship {
  id: string;
  user_id: string;
  internship_id: string;
  status: SavedStatus;
  created_at: string;
  updated_at: string;
}

export interface SavedInternshipResult {
  data: SavedInternship | null;
  error: string | null;
}

export interface SavedInternshipsResult {
  data: SavedInternship[];
  error: string | null;
}
