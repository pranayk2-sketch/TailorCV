export interface InternshipDescription {
  internshipId: string;
  fetchedAt: string;
  checksum: string;
  cleanedPreview: string;
}

export interface DescriptionPreview {
  cleanedText: string;
  fetchedAt: string;
  checksum: string;
  preview: string;
}
