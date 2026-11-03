import type { CareerPosition } from '../../experience/types';

/** Only confirmed client information or explicitly marked provisional data. */
export const profile = {
  name: 'Nyirarukundo Seraphine',
  title: 'Water Treatment Plant Engineer',
  field: 'Water Quality & Production',
  location: 'Kigali, Rwanda',
  statement: 'Water is life.',
  experience: '11 years', // From client's questionnaire; verify before launch.
  employer: 'WASAC Group',
  summary: 'Bringing together water treatment operations, water quality management, scientific practice and team coordination.',
  career: [
    {
      title: 'Water Treatment Plant Engineer',
      employer: 'WASAC Group',
      period: '2022 — Present',
      responsibilities: 'Water quality management and production.',
      provisional: true,
    },
    {
      title: 'WTP Engineer',
      employer: 'WASAC Group',
      period: '2015 — 2021',
      responsibilities: 'Water quality, microbiology, chemistry and solution preparation.',
      provisional: true,
    },
  ] satisfies CareerPosition[],
  education: [
    { year: '2022', qualification: 'Master of Business Administration', institution: 'Kigali Independent University', note: '' },
    { year: '2014', qualification: 'Microbiology', institution: 'University of Rwanda', note: 'Exact award title to confirm' },
    { year: '2008', qualification: 'Biology & Chemistry', institution: 'École Secondaire de Ruhango', note: 'Certificate title to confirm' },
  ],
} as const;
