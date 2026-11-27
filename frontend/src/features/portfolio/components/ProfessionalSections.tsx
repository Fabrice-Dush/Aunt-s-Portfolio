import { SectionHeading } from '../../../shared/components/ui/SectionHeading';
import { ExpertiseIcon } from '../../expertise/components/ExpertiseIcon';
import type { PublicContent } from '../types';

export function TechnicalCompetencies({ skills }: { skills: PublicContent['skills'] }) {
  if (!skills.length) return null;
  const groups = new Map<string, PublicContent['skills']>();
  for (const skill of skills) {
    const category = skill.category?.replace(/^technical\s*\//i, '').trim() || 'Technical practice';
    groups.set(category, [...(groups.get(category) ?? []), skill]);
  }
  return <section id="competencies" tabIndex={-1} className="section section-competencies"><div className="section-inner">
    <SectionHeading eyebrow="TECHNICAL COMPETENCIES" title="The detail behind" accent="the discipline." />
    <div className="competency-groups">{[...groups].map(([category, rows]) => <div className="competency-group" key={category}>
      <h3><ExpertiseIcon name={/laboratory|quality/i.test(category) ? 'microscope' : /coordination|management|team/i.test(category) ? 'team' : /production/i.test(category) ? 'production' : 'droplet'} />{category}</h3>
      {rows.map(row => <details className="competency-item" key={row.id}><summary>{row.name}</summary>{row.description && <p>{row.description}</p>}</details>)}
    </div>)}</div>
  </div></section>;
}

export function ProfessionalOutlook({ statements }: { statements: PublicContent['skills'] }) {
  if (!statements.length) return null;
  return <section id="outlook" tabIndex={-1} className="section section-outlook"><div className="two-column">
    <SectionHeading eyebrow="LEADERSHIP & PROFESSIONAL OUTLOOK" title="A considered" accent="way forward." />
    <div className="outlook-statements">{statements.map(row => <article key={row.id}><h3>{row.name}</h3><p>{row.description}</p></article>)}</div>
  </div></section>;
}
