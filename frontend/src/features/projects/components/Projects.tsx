import { SectionHeading } from '../../../shared/components/ui/SectionHeading';

export function Projects() {
  return (
    <section id="projects" className="section section-projects">
      <div className="two-column">
        <SectionHeading eyebrow="05 / THE WORK" title="A place for real" accent="impact." />
        <div className="projects-placeholder">
          <span className="placeholder-marker" aria-hidden="true">✳</span>
          <p className="eyebrow">PROJECT CASE STUDIES / DETAILS PENDING</p>
          <h3>Work worth documenting.</h3>
          <p>Verified project case studies, measurable improvements, and selected achievements will appear here once Seraphine provides and approves the details.</p>
        </div>
      </div>
    </section>
  );
}
