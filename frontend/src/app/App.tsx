import { useEffect, useState } from "react";
import { Header } from "../shared/components/layout/Header";
import { Footer } from "../shared/components/layout/Footer";
import { HomePage } from "../features/portfolio/pages/HomePage";
import type { PublicContent } from "../features/portfolio/types";
import type { NavigationLink } from "../shared/components/layout/types";

export default function App({
  initialContent = null,
}: {
  initialContent?: PublicContent | null;
}) {
  const [content, setContent] = useState(initialContent);
  useEffect(() => {
    let active = true;
    let inFlight = false;
    async function refresh() {
      if (inFlight) return;
      inFlight = true;
      try {
        const response = await fetch("/api/v1/public-content", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Unavailable");
        const result = await response.json();
        if (active) setContent(result.data);
      } catch {
        if (active) setContent(null);
      } finally {
        inFlight = false;
      }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  const profile = content?.profile;
  useEffect(() => {
    document.title = profile
      ? content?.settings?.siteTitle ||
        profile.fullName + " | " + profile.professionalTitle
      : "Portfolio temporarily unavailable";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        profile ? content?.settings?.description || profile.summary || "" : "",
      );
  }, [content, profile]);
  const navigation: NavigationLink[] =
    profile && content
      ? [
          { label: "About", href: "#about" },
          ...(content.skills.length
            ? [{ label: "Expertise", href: "#expertise" as const }]
            : []),
          ...(content.experience.length
            ? [{ label: "Experience", href: "#experience" as const }]
            : []),
          ...(content.education.length
            ? [{ label: "Education", href: "#education" as const }]
            : []),
          ...(content.projects.length
            ? [{ label: "Projects", href: "#projects" as const }]
            : []),
          ...(content.achievements.length
            ? [{ label: "Achievements", href: "#achievements" as const }]
            : []),
          ...(content.certifications.length
            ? [{ label: "Training", href: "#training" as const }]
            : []),
          { label: "Contact", href: "#contact" },
        ]
      : [];
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div id="top" tabIndex={-1} className="development-banner">
        PRIVATE DESIGN REVIEW <span aria-hidden="true">/</span> NOT YET
        PUBLISHED
      </div>
      <Header links={navigation} />
      {profile && content ? (
        <HomePage content={content} profile={profile} />
      ) : (
        <main id="main-content" className="section" tabIndex={-1}>
          <h1>Portfolio temporarily unavailable</h1>
          <p>Please try again shortly.</p>
        </main>
      )}
      <Footer
        name={profile?.fullName ?? "Nyirarukundo Seraphine"}
        location={
          profile
            ? [profile.city, profile.country].filter(Boolean).join(", ") ||
              profile.location ||
              ""
            : ""
        }
        links={navigation.filter((link) =>
          ["#about", "#experience", "#contact"].includes(link.href),
        )}
      />
    </>
  );
}
