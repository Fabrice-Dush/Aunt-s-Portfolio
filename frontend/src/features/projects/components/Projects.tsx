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
            <article className={'project' + (!project.images?.length ? ' without-media' : '')} key={project.id} id={project.slug ? 'project-' + project.slug : undefined}>
              {!!project.images?.length ? <div className="project-visual"><img {...project.images[0]} loading="lazy" decoding="async" /></div> : <p className="eyebrow">{project.category || 'Selected contribution'}</p>}
              <div className="project-copy">
              {!!project.images?.length && <p className="eyebrow">{project.category}</p>}<h3>{project.name}</h3>
              <p>{project.description}</p>
              <dl>{project.role && <div><dt>Role</dt><dd>{project.role}</dd></div>}{project.period && <div><dt>Period</dt><dd>{project.period}</dd></div>}</dl>
              {!!project.outcomes?.length && <><h4>Outcomes</h4><ul>{project.outcomes.map(outcome => <li key={outcome}>{outcome}</li>)}</ul></>}
              {(project.supportingInformation || (project.images?.length ?? 0) > 1) && <details className="project-detail"><summary>Explore the contribution</summary>{project.supportingInformation && <p>{project.supportingInformation}</p>}{(project.images?.length ?? 0) > 1 && <div className="project-images">{project.images!.slice(1).map(image => <img key={image.src} {...image} loading="lazy" decoding="async" />)}</div>}</details>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
