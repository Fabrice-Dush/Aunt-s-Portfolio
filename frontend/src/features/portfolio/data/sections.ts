import type { PublicContent } from '../types';

// Explicit CMS categories opt records into these sections. Unclassified skills
// remain broad expertise; no personal methods or outlook are inferred.
export function professionalSkills(skills: PublicContent['skills']) {
  return {
    expertise: skills.filter(skill => !/^technical\s*\/|^professional outlook$/i.test(skill.category?.trim() ?? '')),
    technical: skills.filter(skill => /^technical\s*\//i.test(skill.category?.trim() ?? '')),
    outlook: skills.filter(skill => /^professional outlook$/i.test(skill.category?.trim() ?? '') && skill.description?.trim()),
  };
}
