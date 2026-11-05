import { SectionHeading } from '../../../shared/components/ui/SectionHeading';
import { ExpertiseIcon } from './ExpertiseIcon';
import type { PublicContent } from '../../portfolio/types';

export function Expertise({ skills }: { skills: PublicContent['skills'] }) {
  return (
    <section id="expertise" tabIndex={-1} className="section section-expertise">
      <div className="section-topline"><SectionHeading eyebrow="02 / SPECIALIZATIONS" title="Expertise in every" accent="detail." /><p>From treatment processes to team coordination: the science and daily work behind water quality.</p></div>
      <div className="expertise-grid">
        {skills.map(({ id, name, description, category }, index) => (
          <article className="expertise-card" key={id}>
            <span className="card-index">{String(index + 1).padStart(2,'0')} / {String(skills.length).padStart(2,'0')}</span>
            <span className="expertise-icon"><ExpertiseIcon name="droplet" /></span>
            <h3>{name}</h3>{category && <p>{category}</p>}<p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
