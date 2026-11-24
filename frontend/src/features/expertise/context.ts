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
