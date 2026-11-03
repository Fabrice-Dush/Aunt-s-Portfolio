import { SectionHeading } from '../../../shared/components/ui/SectionHeading';
import { ExpertiseIcon } from './ExpertiseIcon';
import { specialties } from '../data/specialties';

export function Expertise() {
  return (
    <section id="expertise" className="section section-expertise">
      <div className="section-topline"><SectionHeading eyebrow="02 / SPECIALIZATIONS" title="Expertise in every" accent="detail." /><p>Grounded in practical responsibilities recorded in Seraphine's professional questionnaire.</p></div>
      <div className="expertise-grid">
        {specialties.map(({ icon, title, body }, index) => (
          <article className="expertise-card" key={title}>
            <span className="card-index">0{index + 1} / 04</span>
            <span className="expertise-icon"><ExpertiseIcon name={icon} /></span>
            <h3>{title}</h3><p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
