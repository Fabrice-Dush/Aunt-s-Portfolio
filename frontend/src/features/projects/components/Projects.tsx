import { SectionHeading } from '../../../shared/components/ui/SectionHeading';
import type { PortfolioProject } from '../types';

export function Projects({ projects }: { projects: readonly PortfolioProject[] }) {
  const published = projects.filter(project => project.publicationApproved);
  if (!published.length) return null;
  return (
    <section id="projects" tabIndex={-1} className="section section-projects" aria-label="Selected projects">
      <div className="section-inner">
        <SectionHeading eyebrow="SELECTED WORK" title="Science put into" accent="practice." />
        <div className="project-list">
          {published.map(project => (
            <article className="project" key={project.id}>
              <p className="eyebrow">{project.category}</p><h3>{project.name}</h3>
              <p>{project.description}</p>
              <dl><div><dt>Role</dt><dd>{project.role}</dd></div>{project.period && <div><dt>Period</dt><dd>{project.period}</dd></div>}</dl>
              {!!project.images?.length && <div className="project-images">{project.images.map(image => <img key={image.src} {...image} loading="lazy" decoding="async" />)}</div>}
              {!!project.outcomes?.length && <><h4>Outcomes</h4><ul>{project.outcomes.map(outcome => <li key={outcome}>{outcome}</li>)}</ul></>}
              {project.supportingInformation && <p>{project.supportingInformation}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
