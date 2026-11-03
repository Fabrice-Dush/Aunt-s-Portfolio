import { SectionHeading } from '../../../shared/components/ui/SectionHeading';
import type { CareerPosition } from '../types';

export function Experience({ positions }: { positions: readonly CareerPosition[] }) {
  return (
    <section id="experience" className="section section-experience">
      <div className="two-column">
        <div><SectionHeading eyebrow="03 / PROFESSIONAL JOURNEY" title="Experience shaped by" accent="responsibility." /><p className="editorial-note">The job periods shown are provisional and will be confirmed with Seraphine before launch.</p></div>
        <div className="timeline">
          {positions.map((item) => (
            <article className="timeline-item" key={item.period}>
              <p className="timeline-period">{item.period} <span>TO VERIFY</span></p>
              <h3>{item.title}</h3>
              <p className="timeline-employer">{item.employer}</p>
              <p className="timeline-responsibilities">{item.responsibilities}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
