import { Hero } from '../components/Hero';
import { Overview } from '../components/Overview';
import { About } from '../components/About';
import { Contact } from '../components/Contact';
import { Expertise } from '../../expertise/components/Expertise';
import { Experience } from '../../experience/components/Experience';
import { Education } from '../../education/components/Education';
import { Projects } from '../../projects/components/Projects';
import { profile } from '../data/profile';
import { publicContact } from '../data/contact';
import { publishedProjects } from '../../projects/data/projects';
import { Training } from '../../certifications/components/Training';
import { training } from '../../certifications/data/training';
import { useSectionReveal } from '../../../shared/hooks/useSectionReveal';

export function HomePage() {
  const ref = useSectionReveal();
  return (
    <main id="main-content" tabIndex={-1} ref={ref}>
      <Hero /><Overview /><About /><Expertise />
      <Experience positions={profile.career} /><Education entries={profile.education} />
      <Projects projects={publishedProjects} /><Training entries={training} />
      <Contact contact={publicContact} />
    </main>
  );
}
