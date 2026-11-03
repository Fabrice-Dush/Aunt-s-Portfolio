import { SectionHeading } from '../../../shared/components/ui/SectionHeading';

export function About() {
  return (
    <section id="about" className="section section-about">
      <div className="two-column">
        <SectionHeading eyebrow="01 / THE PERSON" title="Engineering solutions with" accent="purpose." />
        <div className="about-description">
          <p className="about-lead">Reliable water systems begin with careful science and committed people.</p>
          <p>Based in Kigali, Seraphine works across water treatment, water quality control, microbiology, chemistry, production and team coordination. Her professional background combines technical experience with business administration studies.</p>
          <p>She is interested in management opportunities that bring operational knowledge together with leadership.</p>
          <a className="text-link" href="#experience">Explore career journey <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}
