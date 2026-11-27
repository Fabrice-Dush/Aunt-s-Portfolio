import type { PublicProfile } from '../types';
import { WaterArt } from '../../../shared/components/ui/WaterArt';

export function Hero({ profile, hasExpertise }: { profile: PublicProfile; hasExpertise: boolean }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-container">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="eyebrow-rule" /> {[profile.city, profile.country].filter(Boolean).join(', ') || 'PROFESSIONAL PORTFOLIO'}</p>
          <h1 id="hero-title"><span>Nyirarukundo</span><strong>Seraphine<span className="hero-period" aria-hidden="true">.</span></strong></h1>
          <p className="hero-role">{profile.professionalTitle}</p>
          {profile.motto && <div className="hero-signoff"><span className="fine-line"/> <span>“{profile.motto}”</span></div>}
          <p className="hero-summary">{profile.summary}</p>
          <div className="hero-actions">
            <a className="button-primary" href={hasExpertise ? '#expertise' : '#contact'}>{hasExpertise ? 'Explore my expertise' : 'Get in touch'}</a>
            <a className="button-text" href="#about">About me</a>
          </div>
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
          <span className="hero-vertical-text" aria-hidden="true">SCIENCE × PEOPLE × PURPOSE</span>
        </div>
      </div>
      <WaterArt className="hero-water" eager />
      <a className="scroll-cue" href="#about"><span aria-hidden="true">⌄</span>Scroll to explore</a>
    </section>
  );
}
