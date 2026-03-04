import type { InternshipFilters } from './internship';

export interface FilterPreset {
  id: string;
  user_id: string;
  name: string;
  filters: InternshipFilters;
  created_at: string;
  updated_at: string;
}

export interface FilterPresetResult {
  data: FilterPreset | null;
  error: string | null;
}

export interface FilterPresetsResult {
  data: FilterPreset[];
  error: string | null;
}
