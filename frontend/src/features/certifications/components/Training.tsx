import { SectionHeading } from '../../../shared/components/ui/SectionHeading';
import type { Training as TrainingEntry } from '../types';

export function Training({ entries }: { entries: readonly TrainingEntry[] }) {
  if (!entries.length) return null;
  return (
    <section id="training" tabIndex={-1} className="section section-training">
      <div className="two-column">
        <div><SectionHeading eyebrow="05 / CONTINUING LEARNING" title="Building on" accent="experience." />
          {entries.some(entry => !entry.certificate) && <p className="editorial-note">Professional training areas. Official certificate titles, providers and dates are awaiting confirmation.</p>}</div>
        <ol className="training-list">{entries.map((entry, index) => (
          <li className="training-item" key={entry.area}>
            <span aria-hidden="true">0{index + 1}</span><div><h3>{entry.area}</h3>
              {entry.certificate && <p>{entry.certificate.title} · {entry.certificate.issuer}{entry.certificate.year && ` · ${entry.certificate.year}`}</p>}
            </div>
          </li>
        ))}</ol>
      </div>
    </section>
  );
}
