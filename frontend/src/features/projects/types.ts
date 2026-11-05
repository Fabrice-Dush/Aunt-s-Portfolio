export type PortfolioProject = {
  id: string;
  slug?: string;
  name: string;
  description: string;
  category: string;
  role: string;
  period?: string;
  images?: readonly { src: string; alt: string; width?: number; height?: number }[];
  outcomes?: readonly string[];
  supportingInformation?: string;
  publicationApproved: boolean;
};
