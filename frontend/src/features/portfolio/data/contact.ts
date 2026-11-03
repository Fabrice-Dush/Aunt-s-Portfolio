export type PublicContact = {
  email?: { value: string; publicationApproved: true };
  phone?: { display: string; international: string; publicationApproved: true };
};

// Add ONLY owner-approved public details. Unapproved values must stay out of source/builds.
export const publicContact: PublicContact = {};
