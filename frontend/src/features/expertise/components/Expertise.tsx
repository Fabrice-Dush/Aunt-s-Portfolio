import { useEffect, useState } from 'react';
import { SectionHeading } from '../../../shared/components/ui/SectionHeading';
import { ExpertiseIcon } from './ExpertiseIcon';
import type { PublicContent } from '../../portfolio/types';
import { specializationInformation } from '../context';

const educationalNotice = 'Educational context, not a statement of Seraphine’s individual duties or achievements.';

export function Expertise({ skills }: { skills: PublicContent['skills'] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => setEnhanced(true), []);
  const current = skills.find(skill => skill.id === selected) ?? skills[0];
  if (!current) return null;
  const information = specializationInformation(current);
  const detail = <>
    <p className="eyebrow">{information.educational ? 'General field context' : 'Published specialization'}</p>
    <p>{information.explanation}</p>
    {information.educational && <small>{educationalNotice}</small>}
  </>;
  return (
    <section id="expertise" tabIndex={-1} className="section section-expertise">
      <div className="section-topline">
        <SectionHeading eyebrow="02 / EXPERTISE" title="Expertise, carefully" accent="considered." />
        <p>Explore each specialization and its context. General field explanations are marked as educational.</p>
      </div>
      <div className={'expertise-composition' + (skills.length === 6 ? ' has-six' : '')} data-specialization={current.name.toLowerCase()}>
        <div className="expertise-sculpture" aria-hidden="true"><img key={current.id} src="/images/water-sculpture.webp" width="640" height="800" alt="" loading="lazy" decoding="async" /></div>
        <div className="expertise-grid" role="group" aria-label="Specializations">
          {skills.map(skill => {
            const info = specializationInformation(skill);
            const active = current.id === skill.id;
            return <div className="expertise-option" key={skill.id}>
              <button type="button" className="expertise-card" disabled={!enhanced} aria-pressed={active} aria-controls="expertise-detail expertise-mobile-detail" onClick={() => setSelected(skill.id)}>
                <span className="expertise-icon"><ExpertiseIcon name={info.icon} /></span>
                <span className="expertise-card-copy">
                  <span className="expertise-name">{skill.name}</span>
                  {skill.category && skill.category !== skill.name && <span className="expertise-category">{skill.category}</span>}
                  <span className="expertise-description">{info.summary}</span>
                  {info.educational && <span className="expertise-provenance">Educational context</span>}
                </span>
                <span className="expertise-indicator" aria-hidden="true">{active ? '−' : '+'}</span>
              </button>
              {active && <div id="expertise-mobile-detail" className="expertise-mobile-detail" aria-live="polite" aria-atomic="true">{detail}</div>}
            </div>;
          })}
        </div>
      </div>
      <div id="expertise-detail" className="expertise-detail" aria-live="polite" aria-atomic="true">
        <div className="expertise-detail-heading"><ExpertiseIcon name={information.icon} /><h3>{current.name}</h3></div>
        <div key={current.id} className="expertise-explanation">{detail}</div>
      </div>
      <noscript><div className="expertise-fallback"><p>Specialization explanations</p>{skills.map(skill => {
        const info = specializationInformation(skill);
        return <details key={skill.id}><summary>{skill.name}</summary><p>{info.explanation}</p>{info.educational && <p>{educationalNotice}</p>}</details>;
      })}</div></noscript>
    </section>
  );
}
