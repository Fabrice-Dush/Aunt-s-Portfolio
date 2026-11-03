type IconName = 'droplet' | 'microscope' | 'production' | 'team';

export function ExpertiseIcon({ name }: { name: IconName }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" {...common}>
      {name === 'droplet' && <><path d="M16 3C11 10 6.5 15 6.5 21A9.5 9.5 0 0 0 25.5 21C25.5 15 21 10 16 3Z"/><path d="M11 21a5 5 0 0 0 5 5"/></>}
      {name === 'microscope' && <><path d="m10 5 7 6-4 4-7-6zM14 15l4 5M18 20a6 6 0 0 1-6 6M7 27h19M20 7l4-4M23 8l3-3"/><circle cx="18" cy="21" r="2"/></>}
      {name === 'production' && <><path d="M5 28h22M9 25V16h5v9M17 25V10h5v15M25 25V5h3v20M4 11l8-5 7 3 8-6"/></>}
      {name === 'team' && <><circle cx="12" cy="12" r="4"/><circle cx="23" cy="14" r="3"/><path d="M4 27v-3c0-5 4-8 8-8s8 3 8 8v3M21 20c4 0 7 2 7 6v1"/></>}
    </svg>
  );
}
