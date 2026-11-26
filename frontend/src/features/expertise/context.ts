// Educational context, never personal responsibilities or CMS seed content.
// Water science references and review requirements: docs/PUBLIC_STORYTELLING.md.
export const specializationContext: Record<string, { icon: 'droplet' | 'microscope' | 'production' | 'team'; text: string }> = {
  'water treatment': { icon: 'droplet', text: 'Treatment uses barriers chosen for the source water and the risks present. Processes may separate particles, filter water and disinfect it; their combination and control matter as much as any individual step.' },
  'water quality': { icon: 'droplet', text: 'Water quality considers microbial, chemical and physical characteristics. Sampling and monitoring help assess a supply, while risk management addresses hazards before they reach consumers. Clear-looking water alone does not establish safety.' },
  microbiology: { icon: 'microscope', text: 'Microbiology examines organisms too small to see unaided. In drinking-water work, microbial indicators and appropriate testing help assess contamination risks; results must be interpreted alongside source conditions and treatment performance.' },
  production: { icon: 'production', text: 'Water production connects treatment with day-to-day operation. Coordinating process checks, equipment readiness and operating records helps maintain continuity while keeping water-quality requirements central to operational decisions.' },
  'laboratory operations': { icon: 'microscope', text: 'Laboratory work turns samples into information that can support decisions. Representative sampling, careful handling, suitable analytical methods and quality checks help make results dependable and traceable.' },
  management: { icon: 'team', text: 'Management connects people, plans and follow-through. In water operations, clear responsibilities, communication, documentation and review support coordinated decisions and timely responses when conditions change.' },
};

// Short definitions accompany the existing educational detail, never inferred skills.
const fieldSummaries: Record<string, string> = {
  'water treatment': 'Treatment barriers that address source-water risks.',
  'water quality': 'Understanding microbial, chemical and physical water characteristics.',
  microbiology: 'Microorganisms, indicators and contamination risks in drinking water.',
  production: 'Coordinating water production with quality and continuity in view.',
  'laboratory operations': 'Reliable information through careful sampling, analysis and quality checks.',
  management: 'Connecting people, planning and review for coordinated decisions.',
};

export function specializationInformation(skill: { name: string; description: string | null }) {
  const key = skill.name.trim().toLowerCase();
  const description = skill.description?.trim();
  const context = Object.hasOwn(specializationContext, key) ? specializationContext[key] : undefined;
  return {
    icon: context?.icon ?? 'droplet' as const,
    educational: !description,
    // A complete first sentence gives authored content priority without clipping it.
    summary: description?.match(/^.*?[.!?](?=\s|$)/s)?.[0] || description || (Object.hasOwn(fieldSummaries, key) ? fieldSummaries[key] : 'An area of specialization in the published portfolio.'),
    explanation: description || context?.text || 'Further details for this published specialization have not yet been provided.',
  };
}
