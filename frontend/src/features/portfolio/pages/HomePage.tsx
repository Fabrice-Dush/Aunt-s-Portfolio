import { Hero } from "../components/Hero";
import { Overview } from "../components/Overview";
import { About } from "../components/About";
import { Contact } from "../components/Contact";
import { ContactForm } from "../components/ContactForm";
import { Expertise } from "../../expertise/components/Expertise";
import { Experience } from "../../experience/components/Experience";
import { Education } from "../../education/components/Education";
import { Projects } from "../../projects/components/Projects";
import { useSectionReveal } from "../../../shared/hooks/useSectionReveal";
import { SectionHeading } from "../../../shared/components/ui/SectionHeading";
import type { PublicContent, PublicProfile } from "../types";

export const period = (
  start: number | null,
  end: number | null,
  current = false,
) => [start, current ? "Present" : end].filter((v) => v !== null).join(" — ");
export function HomePage({
  content,
  profile,
}: {
  content: PublicContent;
  profile: PublicProfile;
}) {
  const ref = useSectionReveal();
  return (
    <main id="main-content" tabIndex={-1} ref={ref}>
      <Hero profile={profile} hasExperience={!!content.experience.length} />
      <Overview profile={profile} />
      <About profile={profile} />
      {!!content.skills.length && <Expertise skills={content.skills} />}
      {!!content.experience.length && (
        <Experience
          positions={content.experience.map((row) => ({
            title: row.jobTitle,
            employer: row.organization,
            period: period(row.startYear, row.endYear, row.isCurrent),
            responsibilities: [row.description, row.responsibilities]
              .filter(Boolean)
              .join("\n"),
            provisional: false,
          }))}
        />
      )}
      {!!content.education.length && (
        <Education
          entries={content.education.map((row) => ({
            year: row.yearCompleted?.toString() ?? "",
            qualification: row.qualification,
            institution: [row.institution, row.country]
              .filter(Boolean)
              .join(" · "),
            note: row.notes ?? "",
          }))}
        />
      )}
      <Projects
        projects={content.projects.map((row) => ({
          id: row.id,
          slug: row.slug,
          name: row.title,
          description: row.summary ?? "",
          category: row.featured
            ? "Featured project"
            : (row.organization ?? ""),
          role: row.role ?? "",
          period: period(row.startYear, row.endYear) || row.year?.toString(),
          publicationApproved: true,
          supportingInformation: row.body ?? undefined,
          outcomes: row.result ? [row.result] : [],
          images: row.media
            .filter((m) => m.mimeType.startsWith("image/"))
            .map((m) => ({ src: m.publicUrl, alt: m.altText ?? "" })),
        }))}
      />
      {!!content.achievements.length && (
        <section id="achievements" tabIndex={-1} className="section section-achievements">
          <div className="section-inner">
            <SectionHeading
              eyebrow="ACHIEVEMENTS"
              title="Milestones with"
              accent="meaning."
            />
            <div className="education-list">
              {content.achievements.map((row) => (
                <article key={row.id} className="education-item">
                  <time>{row.year}</time>
                  <div>
                    <h3>{row.title}</h3>
                    <p>{row.description}</p>
                    {row.project && <p>{row.project.title}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
      {!!content.certifications.length && (
        <section
          id="training"
          tabIndex={-1}
          className="section section-training"
        >
          <div className="two-column">
            <SectionHeading
              eyebrow="05 / CONTINUING LEARNING"
              title="Building on"
              accent="experience."
            />
            <ol className="training-list">
              {content.certifications.map((row, index) => (
                <li className="training-item" key={row.id}>
                  <span aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{row.title}</h3>
                    <p>{[row.issuer, row.year].filter(Boolean).join(" · ")}</p>
                    <p>{row.credentialDetails}</p>
                    {row.media && (
                      <a href={row.media.publicUrl}>
                        View approved document ↗
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
      <Contact
        location={
          [profile.city, profile.country].filter(Boolean).join(", ") ||
          profile.location ||
          ""
        }
        contact={{
          ...(profile.contact?.email
            ? {
                email: {
                  value: profile.contact.email,
                  publicationApproved: true,
                },
              }
            : {}),
          ...(profile.contact?.phone
            ? {
                phone: {
                  international: profile.contact.phone,
                  display: profile.contact.phone,
                  publicationApproved: true,
                },
              }
            : {}),
        }}
      />
      <ContactForm />
    </main>
  );
}
