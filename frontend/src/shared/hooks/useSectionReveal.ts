import { useEffect, useRef } from 'react';

/** Entry motion never gates content visibility or depends on JavaScript to reveal text. */
export function useSectionReveal() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!ref.current || !('IntersectionObserver' in window)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-entered');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08 });
    ref.current.querySelectorAll('.section-heading, .timeline-item, .training-item').forEach(node => observer.observe(node));
    const stop = () => { if (motion.matches) observer.disconnect(); };
    motion.addEventListener('change', stop);
    return () => { observer.disconnect(); motion.removeEventListener('change', stop); };
  }, []);
  return ref;
}
