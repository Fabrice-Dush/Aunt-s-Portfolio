import { SectionHeading } from "../../../shared/components/ui/SectionHeading";
import type { PublicProfile } from "../types";
import { WaterArt } from "../../../shared/components/ui/WaterArt";
export function About({ profile }: { profile: PublicProfile }) {
  return (
    <section id="about" tabIndex={-1} className="section section-about">
      <div className="two-column">
        <div><SectionHeading
          eyebrow="01 / ABOUT"
          title="Engineering solutions for"
          accent="clean and safe water."
        />{profile.motto && <p className="about-motto">“{profile.motto}”</p>}</div>
        <div className="about-description">
          {profile.summary && <p className="about-lead">{profile.summary}</p>}
          {profile.biography
            ?.split("\n")
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          <dl className="about-identity"><div><dt>Professional field</dt><dd>{profile.professionalTitle}</dd></div>{(profile.city || profile.country || profile.location) && <div><dt>Based in</dt><dd>{[profile.city, profile.country].filter(Boolean).join(', ') || profile.location}</dd></div>}</dl>
        </div>
      </div>
      <WaterArt className="about-water" />
    </section>
  );
}
