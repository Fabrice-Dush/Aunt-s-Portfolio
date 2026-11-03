import { SectionHeading } from '../../../shared/components/ui/SectionHeading';

export function About() {
  return (
    <section id="about" tabIndex={-1} className="section section-about">
      <div className="two-column">
        <SectionHeading eyebrow="01 / THE PERSON" title="Engineering solutions with" accent="purpose." />
        <div className="about-description">
          <p className="about-lead">Reliable water systems begin with careful science and committed people.</p>
          <p>Based in Kigali, Seraphine brings 11 years of experience, as recorded in her professional questionnaire, to water treatment and water quality work at WASAC Group. Her responsibilities span microbiology, chemistry, solution preparation, production and team coordination.</p>
          <p>Her studies in microbiology and business administration connect the science of water quality with the day-to-day work of managing operations.</p>
          <p>She is interested in management opportunities that bring operational knowledge together with leadership.</p>
          <a className="text-link" href="#experience">Explore career journey <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}
