import type { PublicProfile } from '../types';

export function Hero({ profile, hasExperience }: { profile: PublicProfile; hasExperience: boolean }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-container">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="eyebrow-rule" /> {[profile.professionalTitle,profile.city].filter(Boolean).join(' / ')}</p>
          <h1 id="hero-title"><span>Nyirarukundo</span><strong>Seraphine<span className="hero-period" aria-hidden="true">.</span></strong></h1>
          <p className="hero-role">{profile.professionalTitle}</p>
          <p className="hero-summary">{profile.summary}</p>
          <div className="hero-actions">
            {hasExperience && <a className="button-primary" href="#experience">Explore experience <span aria-hidden="true">↗</span></a>}
            <a className="button-text" href="#about">Discover my story <span aria-hidden="true">↓</span></a>
          </div>
          {profile.motto && <div className="hero-signoff"><span className="fine-line"/> <span>“{profile.motto}”</span><span className="signoff-label">A PERSONAL BELIEF</span></div>}
        </div>
        <div className="hero-media">
          <div className="hero-aura" aria-hidden="true" />
          <div className="hero-photo-frame">
            {profile.portrait ? <img src={profile.portrait.publicUrl} style={{ objectFit: 'contain' }} width="1122" height="1402" alt={profile.portrait.altText ?? ''} fetchPriority="high" decoding="async" /> : <img
              src="/images/seraphine-portrait.webp"
              srcSet="/images/seraphine-portrait-small.webp 780w, /images/seraphine-portrait.webp 1122w"
              sizes="(max-width: 600px) calc(100vw - 44px), (max-width: 960px) 480px, (max-width: 1440px) 40vw, 520px"
              width="1122" height="1402"
              alt="Concept standing portrait based on Seraphine's supplied photograph; awaiting her approval"
              fetchPriority="high"
              decoding="async"
            />}
          </div>
          {!profile.portrait && <span className="image-caption">PORTRAIT CONCEPT / OWNER APPROVAL PENDING</span>}
          <span className="hero-vertical-text" aria-hidden="true">SCIENCE × PEOPLE × PURPOSE</span>
        </div>
      </div>
    </section>
  );
}
