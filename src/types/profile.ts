export interface Profile {
  id: string;
  full_name: string;
  email: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ProfileUpdate = Partial<
  Pick<Profile, 'full_name' | 'headline' | 'bio' | 'location' | 'website_url' | 'linkedin_url' | 'github_url'>
>;
