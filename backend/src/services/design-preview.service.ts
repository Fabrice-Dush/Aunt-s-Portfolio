// Server-only, read-only demonstration fixtures. Never seed, persist, verify or
// publish these entries. This module is reachable only through authenticated CMS.
export function designPreview(profile: unknown, skills: unknown[]) {
  const sample = 'SAMPLE — Replace before publication';
  const illustration = { id: 'demo-illustration', publicUrl: '/images/water-ribbon.svg', mimeType: 'image/svg+xml', altText: 'Abstract water illustration for a sample project; not a facility photograph.' };
  return {
    profile,
    skills: [...skills,
      { id: 'demo-skill-sampling', name: `${sample}: sampling records`, category: 'Technical / Laboratory and quality', description: 'Fictional design example: keeping sample identification, handling notes and review steps together. Replace with a verified description of the owner’s actual methods.' },
      { id: 'demo-skill-review', name: `${sample}: quality review`, category: 'Technical / Laboratory and quality', description: 'Fictional design example: checking that results have the context needed for an informed review. No personal qualification or laboratory responsibility is asserted.' },
      { id: 'demo-skill-operations', name: `${sample}: operational handover`, category: 'Technical / Treatment operations', description: 'Fictional design example: a clear handover structure for observations, open questions and follow-up. This is not a description of an actual employer’s procedures.' },
      { id: 'demo-skill-coordination', name: `${sample}: team coordination`, category: 'Technical / Coordination and management', description: 'Fictional design example: organizing a review discussion and recording agreed next steps. Replace with owner-approved competencies.' },
      { id: 'demo-outlook', name: 'Draft professional statement — SAMPLE', category: 'Professional outlook', description: 'Illustrative copy for design review only, not a statement attributed to Seraphine: a professional outlook could explain how someone approaches shared learning, thoughtful decisions and collaboration around reliable water services. Replace this entire example with the owner’s approved words.' },
    ],
    experience: [
      { id: 'demo-experience-1', jobTitle: 'Demonstration career entry — Applied practice', organization: 'Fictional water-services organization', startYear: 2020, endYear: 2023, isCurrent: false, description: 'SAMPLE chronology for layout review only. This position and these dates are fictional and do not represent Seraphine’s employment history.', responsibilities: 'Example responsibilities: organizing a review discussion, documenting observations and preparing a handover. Replace every detail before publication.' },
      { id: 'demo-experience-2', jobTitle: 'Demonstration career entry — Collaborative review', organization: 'Fictional technical team', startYear: 2024, endYear: null, isCurrent: false, description: 'SAMPLE — Replace before publication. A second fictional entry demonstrates how the timeline handles a different text length and an unconfirmed end date.', responsibilities: 'Illustrative contribution: bringing questions from operations and quality review into a shared discussion. No actual leadership role is claimed.' },
    ],
    projects: [
      { id: 'demo-project-1', slug: 'demo-review-notebook', title: 'Sample Project — A water-quality review notebook', summary: 'A fictional contribution showing how a project can connect a clear question, supporting context and a careful review.', body: 'SAMPLE — Replace before publication. This scenario imagines a notebook that brings sampling context and review questions together. It does not describe a real facility, assignment, employer or completed deliverable.', role: 'Illustrative coordination role', result: 'Illustrative deliverable: a proposed review outline. No measured improvement or real outcome is claimed.', organization: 'Fictional demonstration scenario', year: null, startYear: null, endYear: null, featured: true, media: [illustration] },
      { id: 'demo-project-2', slug: 'demo-handover-map', title: 'Sample Project — Making handovers easier to follow', summary: 'A second fictional scenario explores the relationship between observations, follow-up questions and shared records.', body: 'SAMPLE — Replace before publication. The example imagines a visual map for a team handover. It exists only to demonstrate an editorial project layout and expandable supporting information.', role: 'Illustrative documentation role', result: null, organization: 'Fictional demonstration scenario', year: null, startYear: null, endYear: null, featured: false, media: [{ ...illustration, id: 'demo-illustration-2' }] },
      { id: 'demo-project-3', slug: 'demo-learning-session', title: 'Sample Project — A shared learning session', summary: 'An illustrative discussion format bringing treatment themes and review questions into one place.', body: 'SAMPLE — Replace before publication. This third example demonstrates a text-led contribution without attached media. No training delivery, employer activity or personal achievement is asserted.', role: null, result: null, organization: null, year: null, startYear: null, endYear: null, featured: false, media: [] },
    ],
    education: [
      { id: 'demo-education-1', qualification: 'Example Qualification — Water-related studies', institution: 'Fictional demonstration institution', country: null, yearCompleted: 2018, notes: 'SAMPLE qualification and date for layout review only. This is not a degree held by Seraphine. Replace with the official approved qualification and institution.' },
      { id: 'demo-education-2', qualification: 'Example Qualification — Applied science studies', institution: 'Fictional learning institution', country: null, yearCompleted: null, notes: 'SAMPLE — Replace before publication. This entry demonstrates an academic record without a confirmed completion date.' },
    ],
    certifications: [
      { id: 'demo-certificate-1', title: 'Sample Certification — Quality review workshop', issuer: 'Fictional learning provider', year: 2025, credentialDetails: 'SAMPLE — Replace before publication. Fictional professional-development example; no credential number, verification link or real certificate is asserted.', media: null },
      { id: 'demo-certificate-2', title: 'Sample Training — Operational communication', issuer: 'Fictional workshop provider', year: null, credentialDetails: 'SAMPLE design entry demonstrating training without an attached document or verified date.', media: null },
    ],
    achievements: [
      { id: 'demo-achievement-1', title: 'Sample Recognition — Collaborative learning', year: null, description: 'SAMPLE — Replace before publication. Illustrative recognition text for design review; no actual award, numerical result or professional achievement is claimed.', project: null },
    ],
    settings: { siteTitle: 'Protected portfolio design demonstration', description: null, allowIndexing: false },
  };
}
