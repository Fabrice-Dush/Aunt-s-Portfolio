import { SectionHeading } from '../../../shared/components/ui/SectionHeading';
import { ExpertiseIcon } from './ExpertiseIcon';
import type { PublicContent } from '../../portfolio/types';
import { useEffect, useState } from 'react';
import { specializationContext } from '../context';

export function Expertise({ skills }: { skills: PublicContent['skills'] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => setEnhanced(true), []);
  const current = skills.find(skill => skill.id === selected) ?? skills[0];
  if (!current) return null;
  const context = specializationContext[current.name.trim().toLowerCase()];
  const description = current.description?.trim();
  const explanation = description || context?.text || 'Further details for this published specialization have not yet been provided.';
  return (
    <section id="expertise" tabIndex={-1} className="section section-expertise">
      <div className="section-topline"><SectionHeading eyebrow="02 / EXPERTISE" title="Expertise, carefully" accent="considered." /><p>Explore the published specializations. Select an area to read more about its professional context.</p></div>
      <div className={'expertise-composition' + (skills.length === 6 ? ' has-six' : '')} data-specialization={current.name.toLowerCase()}>
        <div className="expertise-sculpture" aria-hidden="true"><img key={current.id} src="/images/water-sculpture.webp" width="640" height="800" alt="" loading="lazy" decoding="async" /></div>
        <div className="expertise-grid" role="group" aria-label="Specializations">
        {skills.map(({ id, name, category }) => (
          <div className="expertise-option" key={id}><button type="button" className="expertise-card" disabled={!enhanced} aria-pressed={current.id === id} aria-controls="expertise-detail expertise-mobile-detail" onClick={() => setSelected(id)}>
            <span className="expertise-icon"><ExpertiseIcon name={specializationContext[name.trim().toLowerCase()]?.icon ?? 'droplet'} /></span>
            <span><span className="expertise-name">{name}</span>{category && category !== name && <span className="expertise-category">{category}</span>}<span className="expertise-description">{current.id === id ? 'Currently exploring' : 'Explore this area'}</span></span>
            <span className="expertise-indicator" aria-hidden="true">{current.id === id ? '−' : '+'}</span>
          </button>{current.id === id && <div id="expertise-mobile-detail" className="expertise-mobile-detail" aria-live="polite" aria-atomic="true"><p className="eyebrow">{description ? 'Published specialization' : 'General field context'}</p><p>{explanation}</p>{!description && <small>Educational context, not a statement of Seraphine’s individual duties or achievements.</small>}</div>}</div>
        ))}
      </div>
      </div>
      <div id="expertise-detail" className="expertise-detail" aria-live="polite" aria-atomic="true">
        <div><span className="eyebrow">{description ? 'Published specialization' : 'General field context'}</span><h3>{current.name}</h3></div>
        <div key={current.id} className="expertise-explanation"><p>{explanation}</p>{!description && <small>Educational context, not a statement of Seraphine’s individual duties or achievements.</small>}</div>
      </div>
      <noscript><div className="expertise-fallback"><p>Specialization explanations</p>{skills.map(skill => <details key={skill.id}><summary>{skill.name}</summary><p>{skill.description?.trim() || specializationContext[skill.name.trim().toLowerCase()]?.text || 'Further details have not yet been provided.'}</p>{!skill.description?.trim() && <p>General educational context; not a personal responsibility statement.</p>}</details>)}</div></noscript>
    </section>
  );
}
