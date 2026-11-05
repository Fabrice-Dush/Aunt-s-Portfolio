import { getDatabase } from '../config/database.js';
import { AppError } from '../utils/AppError.js';

// Explicit field projections; private storage keys and authentication data never enter DTOs.
const publication = { id: true, status: true, isVerified: true } as const;
export async function dashboardSummary(technical: boolean) {
  const db = getDatabase();
  const counts = await db.$transaction([
    db.experience.count(), db.education.count(), db.skill.count(), db.certificate.count(),
    db.project.count({ where: { status: 'PUBLISHED' } }), db.project.count({ where: { status: 'DRAFT' } }),
    db.contactMessage.count(), db.profile.findUnique({ where: { id: 'owner' }, select: { fullName: true, professionalTitle: true, status: true, city: true, country: true } }),
  ]);
  return { experience: counts[0], education: counts[1], skills: counts[2], certifications: counts[3], publishedProjects: counts[4], draftProjects: counts[5], messages: counts[6], profile: counts[7],
    contentStates: await Promise.all(['experience','education','skill','project','achievement','certificate'].map(async model => ({
      area: model, states: await (db[model as 'skill'] as typeof db.skill).groupBy({ by: ['status'], _count: { _all: true } }),
    }))),
    media: await db.mediaAsset.aggregate({ _count: { id: true }, _sum: { bytes: true } }),
    recentPublications: await db.auditLog.findMany({ where: { action: { in: ['CONTENT_PUBLISH','CONTENT_UNPUBLISH'] } }, take: 8, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { action: true, entity: true, createdAt: true } }),
    ...(technical ? { activeAdmins: await db.user.count({ where: { role: 'ADMIN', isActive: true } }) } : {}) };
}
export async function dashboardContent(section: string, page: number) {
  const db = getDatabase();
  const args = { skip: (page - 1) * 20, take: 21, orderBy: { id: 'asc' as const } };
  switch (section) {
    case 'profile': return db.profile.findMany({ select: { id: true, fullName: true, professionalTitle: true, city: true, country: true, motto: true, summary: true, biography: true, experienceDescription: true, status: true }, take: 1 });
    case 'experience': return db.experience.findMany({ ...args, select: { ...publication, jobTitle: true, organization: true, startYear: true, endYear: true, isCurrent: true, description: true, responsibilities: true } });
    case 'education': return db.education.findMany({ ...args, select: { ...publication, qualification: true, institution: true, country: true, yearCompleted: true, notes: true } });
    case 'skills': return db.skill.findMany({ ...args, select: { ...publication, name: true, category: true, description: true } });
    case 'projects': return db.project.findMany({ ...args, select: { ...publication, title: true, summary: true, organization: true, year: true } });
    case 'achievements': return db.achievement.findMany({ ...args, select: { ...publication, title: true, description: true, year: true } });
    case 'certifications': return db.certificate.findMany({ ...args, select: { ...publication, title: true, issuer: true, year: true, credentialDetails: true } });
    case 'messages': return db.contactMessage.findMany({ ...args, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], select: { id: true, senderName: true, senderEmail: true, subject: true, content: true, status: true, createdAt: true } });
    default: throw new AppError(404, 'NOT_FOUND', 'Area not found');
  }
}
export async function securityEvents(page: number) {
  return getDatabase().auditLog.findMany({ skip: (page - 1) * 20, take: 21, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: { id: true, action: true, entityId: true, createdAt: true, actor: { select: { displayName: true } } } });
}
export async function systemStatus() {
  await getDatabase().$queryRaw`SELECT 1`;
  return { api: 'Responding', database: 'Connected', checkedAt: new Date().toISOString(), contentEditing: 'Available', analytics: 'Not collected' };
}
