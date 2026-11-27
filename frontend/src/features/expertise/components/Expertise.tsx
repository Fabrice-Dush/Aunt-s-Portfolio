import { useId } from 'react';
import { SectionHeading } from '../../../shared/components/ui/SectionHeading';
import { ExpertiseIcon } from './ExpertiseIcon';
import type { PublicContent } from '../../portfolio/types';
import { specializationInformation } from '../context';

const educationalNotice = 'Educational context, not a statement of Seraphine’s individual duties or achievements.';

export function Expertise({ skills }: { skills: PublicContent['skills'] }) {
  const group = useId();
  if (!skills.length) return null;
  return (
    <section id="expertise" tabIndex={-1} className="section section-expertise">
      <div className="section-topline">
        <SectionHeading eyebrow="02 / EXPERTISE" title="Expertise, carefully" accent="considered." />
        <p>Explore each specialization and its context. General field explanations are marked as educational.</p>
      </div>
      <div className="expertise-composition">
        <div className="expertise-grid">
          <div className="expertise-sculpture" style={{ gridRow: `1 / span ${Math.ceil(skills.length / 2)}` }} aria-hidden="true">
            <img src="/images/water-sculpture.webp" width="640" height="800" alt="" loading="lazy" decoding="async" />
          </div>
          {skills.map((skill, index) => {
            const info = specializationInformation(skill);
            const trigger = `${group}-trigger-${index}`;
            const panel = `${group}-panel-${index}`;
            return <details className="expertise-option" name={`${group}-specializations`} key={skill.id}>
              <summary className="expertise-card" id={trigger} aria-controls={panel}>
                <span className="expertise-icon"><ExpertiseIcon name={info.icon} /></span>
                <span className="expertise-card-copy">
                  <span className="expertise-name">{skill.name}</span>
                  {skill.category && skill.category !== skill.name && <span className="expertise-category">{skill.category}</span>}
                  <span className="expertise-description">{info.summary}</span>
                  {info.educational && <span className="expertise-provenance">Educational context</span>}
                </span>
                <span className="expertise-indicator" aria-hidden="true" />
              </summary>
              <div id={panel} className="expertise-inline-detail" role="region" aria-labelledby={trigger}>
                <p className="eyebrow">{info.educational ? 'General field context' : 'Published specialization'}</p>
                <p>{info.explanation}</p>
                {info.educational && <small>{educationalNotice}</small>}
              </div>
            </details>;
          })}
        </div>
      </div>
    </section>
  );
}
