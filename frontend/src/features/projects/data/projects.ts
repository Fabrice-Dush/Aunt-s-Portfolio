import type { PortfolioProject } from '../types';

// No project details or outcomes have been supplied and approved.
export const projects: readonly PortfolioProject[] = [];
export const publishedProjects = projects.filter(project => project.publicationApproved);
