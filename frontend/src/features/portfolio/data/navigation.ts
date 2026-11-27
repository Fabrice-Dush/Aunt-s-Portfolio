import type { PublicContent } from '../types';
import type { NavigationLink } from '../../../shared/components/layout/types';
import { professionalSkills } from './sections';

export function portfolioNavigation(content: PublicContent): NavigationLink[] {
  if (!content.profile) return [];
  const skills = professionalSkills(content.skills);
  return [
    { label: 'About', href: '#about' },
    ...(skills.expertise.length ? [{ label: 'Expertise', href: '#expertise' as const }] : []),
    { label: 'Water science', href: '#water-science' },
    ...(content.experience.length ? [{ label: 'Experience', href: '#experience' as const }] : []),
    ...(content.projects.length ? [{ label: 'Projects', href: '#projects' as const }] : []),
    ...(skills.technical.length ? [{ label: 'Competencies', href: '#competencies' as const }] : []),
    ...(content.education.length ? [{ label: 'Education', href: '#education' as const }] : []),
    ...(content.certifications.length ? [{ label: 'Training', href: '#training' as const }] : []),
    ...(content.achievements.length ? [{ label: 'Recognition', href: '#achievements' as const }] : []),
    ...(skills.outlook.length ? [{ label: 'Outlook', href: '#outlook' as const }] : []),
    { label: 'Contact', href: '#contact' },
  ];
}
