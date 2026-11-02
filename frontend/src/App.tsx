import { Header } from './components/Header';
import { SectionHeading } from './components/SectionHeading';
import { ExpertiseIcon } from './components/ExpertiseIcon';
import { profile } from './data/profile';

const specialties = [
  { icon: 'droplet', title: 'Water treatment operations', body: 'Treatment processes, chemical dosing and production activities.' },
  { icon: 'microscope', title: 'Water quality & microbiology', body: 'Water sampling, laboratory testing, monitoring and quality assurance.' },
  { icon: 'production', title: 'Production management', body: 'Water production coordination, process oversight and documentation.' },
  { icon: 'team', title: 'Team coordination', body: 'Collaboration, supervision and operations-focused management.' },
] as const;

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-container">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="eyebrow-rule" /> WATER TREATMENT ENGINEERING / KIGALI</p>
          <h1 id="hero-title"><span>Nyirarukundo</span><strong>Seraphine<span className="hero-period">.</span></strong></h1>
          <p className="hero-role">{profile.title} <span aria-hidden="true">·</span> {profile.field}</p>
          <p className="hero-summary">{profile.summary}</p>
          <div className="hero-actions">
            <a className="button-primary" href="#experience">Explore experience <span aria-hidden="true">↗</span></a>
            <a className="button-text" href="#about">Discover my story <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-signoff"><span className="fine-line"/> <span>“{profile.statement}”</span><span className="signoff-label">A PERSONAL BELIEF</span></div>
        </div>
        <div className="hero-media">
          <div className="hero-aura" aria-hidden="true" />
          <div className="hero-photo-frame">
            <img
              src="/images/seraphine-portrait.webp"
              srcSet="/images/seraphine-portrait-small.webp 780w, /images/seraphine-portrait.webp 1122w"
              sizes="(max-width: 820px) 100vw, 45vw"
              width="1122" height="1402"
              alt="Concept standing portrait based on Seraphine's supplied photograph; awaiting her approval"
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <span className="image-caption">PORTRAIT CONCEPT / OWNER APPROVAL PENDING</span>
          <span className="hero-vertical-text" aria-hidden="true">SCIENCE × PEOPLE × PURPOSE</span>
        </div>
      </div>
    </section>
  );
}

function Overview() {
  return (
    <section className="overview" aria-label="Professional overview">
      <div className="overview-inner">
        <p className="overview-heading">A CAREER AT THE INTERSECTION OF SCIENCE & SERVICE</p>
        <div><strong>{profile.experience}</strong><span>EXPERIENCE*</span></div>
        <div><strong>Water quality</strong><span>TECHNICAL FOCUS</span></div>
        <div><strong>MBA · 2022</strong><span>BUSINESS ADMINISTRATION</span></div>
      </div>
      <p className="overview-disclaimer">*Experience duration is from the client's questionnaire and must be verified before publication.</p>
    </section>
  );
}

function About() {
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

function Expertise() {
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

function Experience() {
  return (
    <section id="experience" className="section section-experience">
      <div className="two-column">
        <div><SectionHeading eyebrow="03 / PROFESSIONAL JOURNEY" title="Experience shaped by" accent="responsibility." /><p className="editorial-note">The job periods shown are provisional and will be confirmed with Seraphine before launch.</p></div>
        <div className="timeline">
          {profile.career.map((item) => (
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

function Education() {
  return (
    <section id="education" className="section section-education">
      <div className="two-column">
        <SectionHeading eyebrow="04 / EDUCATION" title="Scientific foundations." accent="Leadership ambitions." />
        <div className="education-list">
          {profile.education.map((item) => (
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

function Projects() {
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

function Contact() {
  return (
    <section id="contact" className="section section-contact">
      <p className="eyebrow">06 / THE NEXT CHAPTER</p>
      <h2>Let's make a <em>meaningful impact.</em></h2>
      <div className="contact-bottom"><p>Interested in professional opportunities in water operations, quality and management. Public contact details will be enabled with Seraphine's approval.</p><a href="#top" className="text-link">Back to top <span aria-hidden="true">↑</span></a></div>
    </section>
  );
}

function Footer() {
  return <footer className="site-footer"><span className="footer-brand">NS<span>.</span></span><span>© {new Date().getFullYear()} {profile.name.toUpperCase()}</span><span>PHASE 3 DEVELOPMENT FOUNDATION</span></footer>;
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div className="development-banner">DEVELOPMENT PREVIEW <span aria-hidden="true">/</span> NOT YET PUBLISHED</div>
      <Header />
      <main id="main-content"><Hero /><Overview /><About /><Expertise /><Experience /><Education /><Projects /><Contact /></main>
      <Footer />
    </>
  );
}
