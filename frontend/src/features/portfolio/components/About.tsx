import { SectionHeading } from "../../../shared/components/ui/SectionHeading";
import type { PublicProfile } from "../types";
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
          <dl className="about-identity"><div><dt>Professional field</dt><dd>{profile.professionalTitle}</dd></div>{(profile.city || profile.country || profile.location) && <div><dt>Based in</dt><dd>{[profile.city, profile.country].filter(Boolean).join(', ') || profile.location}</dd></div>}</dl>
          {profile.summary && <p className="about-lead">{profile.summary}</p>}
          {profile.biography
            ?.split("\n")
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
      </div>
    </section>
  );
}
