export type PublicContact = {
  email?: { value: string; publicationApproved: true };
  phone?: { display: string; international: string; publicationApproved: true };
};
