import { SectionHeading } from '../../../shared/components/ui/SectionHeading';

type EducationEntry = {
  year: string;
  qualification: string;
  institution: string;
  note: string;
};

export function Education({ entries }: { entries: readonly EducationEntry[] }) {
  return (
    <section id="education" className="section section-education">
      <div className="two-column">
        <SectionHeading eyebrow="04 / EDUCATION" title="Scientific foundations." accent="Leadership ambitions." />
        <div className="education-list">
          {entries.map((item) => (
            <article className="education-item" key={item.year}>
              <time>{item.year}</time>
              <div><h3>{item.qualification}</h3><p>{item.institution}</p>{item.note && <small>{item.note}</small>}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
