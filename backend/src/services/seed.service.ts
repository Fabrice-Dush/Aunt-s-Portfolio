import type { PrismaClient } from '../generated/prisma/client.js';

// Stable IDs, create-only upserts: reruns never overwrite owner/editor changes.
export async function seedDevelopment(db: PrismaClient) {
  await db.$transaction(async tx => {
    await tx.profile.upsert({ where: { id: 'owner' }, update: {}, create: {
      id: 'owner', fullName: 'Nyirarukundo Seraphine', professionalTitle: 'Water Treatment Plant Engineer',
      city: 'Kigali', country: 'Rwanda', location: 'Kigali, Rwanda', motto: 'Water is life.',
      experienceDescription: '11 years, according to the supplied questionnaire',
      summary: 'Water treatment, water quality and production at WASAC Group.', status: 'PUBLISHED',
    } });
    for (const [id, jobTitle, startYear, endYear, isCurrent] of [
      ['seed-experience-2015', 'WTP Engineer', 2015, 2021, false],
      ['seed-experience-2022', 'Water Treatment Plant Engineer', 2022, null, true],
    ] as const) await tx.experience.upsert({ where: { id }, update: {}, create: {
      id, jobTitle, organization: 'WASAC Group', startYear, endYear, isCurrent,
      description: 'Provisional employment period; verify the overlapping questionnaire answers before publishing.',
    } });
    for (const [id, qualification, institution, yearCompleted] of [
      ['seed-education-mba', 'MBA', 'Kigali Independent University', 2022],
      ['seed-education-microbiology', 'Microbiology', 'University of Rwanda', 2014],
      ['seed-education-biology', 'Biology-Chemistry studies', 'Ecole secondaire de Ruhango', 2008],
    ] as const) await tx.education.upsert({ where: { id }, update: {}, create: {
      id, qualification, institution, yearCompleted, notes: 'Confirm official qualification title before publication.',
    } });
    for (const [index, name] of ['Water treatment', 'Water quality', 'Microbiology', 'Production', 'Laboratory operations', 'Management'].entries()) {
      await tx.skill.upsert({ where: { id: `seed-skill-${index}` }, update: {}, create: {
        id: `seed-skill-${index}`, name, isVerified: true, status: 'PUBLISHED', sortOrder: index,
      } });
    }
    for (const [index, title] of ['IT training', 'Mobile laboratory testing', 'Calibration training'].entries()) {
      await tx.certificate.upsert({ where: { id: `seed-training-${index}` }, update: {}, create: { id: `seed-training-${index}`, title } });
    }
    await tx.siteSettings.upsert({ where: { id: 'site' }, update: {}, create: { id: 'site', siteTitle: 'Nyirarukundo Seraphine' } });
  });
}
