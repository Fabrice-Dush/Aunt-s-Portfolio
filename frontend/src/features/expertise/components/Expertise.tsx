import { SectionHeading } from '../../../shared/components/ui/SectionHeading';
import { ExpertiseIcon } from './ExpertiseIcon';
import type { PublicContent } from '../../portfolio/types';
import { useState } from 'react';

export function Expertise({ skills }: { skills: PublicContent['skills'] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const current = skills.find(skill => skill.id === selected) ?? skills[0];
  return (
    <section id="expertise" tabIndex={-1} className="section section-expertise">
      <div className="section-topline"><SectionHeading eyebrow="02 / EXPERTISE" title="Expertise, carefully" accent="considered." /><p>From treatment processes to team coordination: the science and daily work behind water quality.</p></div>
      <div className={'expertise-composition' + (skills.length === 6 ? ' has-six' : '')}>
        <div className="expertise-sculpture" aria-hidden="true"><img src="/images/water-sculpture.webp" width="640" height="800" alt="" loading="lazy" decoding="async" /></div>
        <div className="expertise-grid" role="group" aria-label="Specializations">
        {skills.map(({ id, name, description, category }, index) => (
          <button type="button" className="expertise-card" key={id} aria-pressed={current?.id === id} aria-controls="expertise-detail" onClick={() => setSelected(id)}>
            <span className="expertise-icon"><ExpertiseIcon name={(['droplet','microscope','microscope','production','production','team'] as const)[index % 6]!} /></span>
            <span><span className="expertise-name">{name}</span>{category && <span className="expertise-category">{category}</span>}<span className="expertise-description">{description}</span></span>
            <span className="expertise-indicator" aria-hidden="true">+</span>
          </button>
        ))}
      </div>
      </div>
      <div id="expertise-detail" className="expertise-detail" aria-live="polite" aria-atomic="true">{current && <><strong>{current.name}</strong><p>{current.description || current.category || current.name}</p></>}</div>
    </section>
  );
}
