export type Field = {
  name: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "number"
    | "checkbox"
    | "email"
    | "media"
    | "project";
  required?: boolean;
  max?: number;
};
export const sectionLabels: Record<string, string> = {
  profile: "profile",
  experience: "experience",
  education: "education",
  skills: "skill",
  projects: "project",
  achievements: "achievement",
  certifications: "certification or training",
};
const field = (
  name: string,
  label: string,
  type: Field["type"] = "text",
  max = 200,
  required = false,
): Field => ({ name, label, type, max, required });
const common = [
  field("sortOrder", "Display order", "number"),
  field(
    "isVerified",
    "I have checked these details and they are accurate",
    "checkbox",
  ),
];
// Presentation only; keep every existing allowlisted input and its validation.
export function editorGroups(section: string) {
  const definitions = [
    { title: 'Essential details', description: 'Start with confirmed names, places and dates.', matches: (f: Field) => !['textarea', 'checkbox', 'media', 'project'].includes(f.type ?? '') && !['sortOrder', 'email', 'phone'].includes(f.name) },
    { title: 'Your story', description: 'Use clear, factual wording. Leave unconfirmed details empty.', matches: (f: Field) => f.type === 'textarea' },
    { title: 'Connections & files', description: 'Contact details stay private until separately authorized. Files also need approval for public use.', matches: (f: Field) => ['media', 'project'].includes(f.type ?? '') || ['email', 'phone'].includes(f.name) },
    { title: 'Review & display', description: 'Saving creates a private draft. Review and publish it from the record list.', matches: (f: Field) => f.type === 'checkbox' || f.name === 'sortOrder' },
  ];
  return definitions.map(group => ({ ...group, fields: fields[section]!.filter(group.matches) })).filter(group => group.fields.length);
}
export const fields: Record<string, Field[]> = {
  profile: [
    field("fullName", "Full name", "text", 150, true),
    field("professionalTitle", "Professional title", "text", 200, true),
    field("summary", "Professional introduction", "textarea", 10000),
    field("biography", "Biography", "textarea", 20000),
    field("motto", "Motto", "text", 255),
    field("experienceDescription", "Experience description", "text", 255),
    field("location", "Location", "text", 150),
    field("city", "City", "text", 100),
    field("country", "Country", "text", 100),
    field("email", "Contact email (private until authorized)", "email", 191),
    field("phone", "Contact phone (private until authorized)", "text", 40),
    field("portraitId", "Portrait", "media"),
  ],
  experience: [
    field("jobTitle", "Position", "text", 200, true),
    field("organization", "Organization", "text", 200, true),
    field("startYear", "Start year", "number"),
    field("endYear", "End year", "number"),
    field("isCurrent", "I currently work in this position", "checkbox"),
    field("description", "Description", "textarea", 10000),
    field("responsibilities", "Responsibilities", "textarea", 10000),
    ...common,
  ],
  education: [
    field("qualification", "Official qualification", "text", 200, true),
    field("institution", "Institution", "text", 200, true),
    field("country", "Country", "text", 100),
    field("yearCompleted", "Completion year", "number"),
    field("notes", "Description", "textarea", 10000),
    ...common,
  ],
  skills: [
    field("name", "Skill name", "text", 200, true),
    field("category", "Category", "text", 100),
    field("description", "Description", "textarea", 10000),
    ...common,
  ],
  projects: [
    field("title", "Project title", "text", 220, true),
    field(
      "slug",
      "Project address (lowercase words separated by hyphens)",
      "text",
      191,
      true,
    ),
    field("summary", "Summary", "textarea", 10000),
    field("body", "Detailed description", "textarea", 50000),
    field("role", "Your role", "text", 160),
    field("organization", "Organization", "text", 200),
    field("year", "Year", "number"),
    field("startYear", "Start year", "number"),
    field("endYear", "Completion year", "number"),
    field("result", "Outcomes", "textarea", 10000),
    field("featured", "Feature this project", "checkbox"),
    ...common,
  ],
  achievements: [
    field("title", "Achievement", "text", 220, true),
    field("description", "Description", "textarea", 10000),
    field("year", "Year", "number"),
    field("projectId", "Related project", "project"),
    ...common,
  ],
  certifications: [
    field("title", "Official title", "text", 220, true),
    field("issuer", "Issuing institution", "text", 200),
    field("year", "Completion year", "number"),
    field(
      "credentialDetails",
      "Description and credential details",
      "textarea",
      10000,
    ),
    field("mediaId", "Certificate or training document", "media"),
    ...common,
  ],
};
