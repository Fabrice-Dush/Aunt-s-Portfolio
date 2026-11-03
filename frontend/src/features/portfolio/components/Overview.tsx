import { profile } from '../data/profile';

export function Overview() {
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
