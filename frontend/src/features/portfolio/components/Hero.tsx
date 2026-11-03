import { profile } from '../data/profile';

export function Hero() {
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
