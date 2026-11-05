import { SectionHeading } from "../../../shared/components/ui/SectionHeading";
import type { PublicProfile } from "../types";
export function About({ profile }: { profile: PublicProfile }) {
  return (
    <section id="about" tabIndex={-1} className="section section-about">
      <div className="two-column">
        <SectionHeading
          eyebrow="01 / THE PERSON"
          title="Engineering solutions with"
          accent="purpose."
        />
        <div className="about-description">
          <p className="about-lead">{profile.summary}</p>
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
