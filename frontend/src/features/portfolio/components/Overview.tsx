import type { PublicProfile } from "../types";
export function Overview({ profile }: { profile: PublicProfile }) {
  if (!profile.experienceDescription) return null;
  return (
    <section className="overview" aria-label="Professional overview">
      <div className="overview-inner">
        <p className="overview-heading">
          A CAREER AT THE INTERSECTION OF SCIENCE & SERVICE
        </p>
        <div>
          <strong>{profile.experienceDescription}</strong>
          <span>PROFESSIONAL EXPERIENCE</span>
        </div>
      </div>
    </section>
  );
}
