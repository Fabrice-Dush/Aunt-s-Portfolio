export type PublicMedia = {
  id: string;
  publicUrl: string;
  altText: string | null;
  mimeType: string;
};
export type PublicProfile = {
  fullName: string;
  professionalTitle: string;
  location: string | null;
  city: string | null;
  country: string | null;
  motto: string | null;
  summary: string | null;
  biography: string | null;
  experienceDescription: string | null;
  contact: { email: string | null; phone: string | null } | null;
  portrait: PublicMedia | null;
};
export type PublicContent = {
  profile: PublicProfile | null;
  experience: {
    id: string;
    jobTitle: string;
    organization: string;
    startYear: number | null;
    endYear: number | null;
    isCurrent: boolean;
    description: string | null;
    responsibilities: string | null;
  }[];
  education: {
    id: string;
    qualification: string;
    institution: string;
    country: string | null;
    yearCompleted: number | null;
    notes: string | null;
  }[];
  skills: {
    id: string;
    name: string;
    category: string | null;
    description: string | null;
  }[];
  projects: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    body: string | null;
    role: string | null;
    result: string | null;
    year: number | null;
    organization: string | null;
    startYear: number | null;
    endYear: number | null;
    featured: boolean;
    media: PublicMedia[];
  }[];
  achievements: {
    id: string;
    title: string;
    description: string | null;
    year: number | null;
    project: { slug: string; title: string } | null;
  }[];
  certifications: {
    id: string;
    title: string;
    issuer: string | null;
    year: number | null;
    credentialDetails: string | null;
    media: PublicMedia | null;
  }[];
  settings: {
    siteTitle: string;
    description: string | null;
    allowIndexing: boolean;
  } | null;
};
