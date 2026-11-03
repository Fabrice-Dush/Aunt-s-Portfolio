import { Hero } from '../components/Hero';
import { Overview } from '../components/Overview';
import { About } from '../components/About';
import { Contact } from '../components/Contact';
import { Expertise } from '../../expertise/components/Expertise';
import { Experience } from '../../experience/components/Experience';
import { Education } from '../../education/components/Education';
import { Projects } from '../../projects/components/Projects';
import { profile } from '../data/profile';

export function HomePage() {
  return (
    <main id="main-content"><Hero /><Overview /><About /><Expertise /><Experience positions={profile.career} /><Education entries={profile.education} /><Projects /><Contact /></main>
  );
}
