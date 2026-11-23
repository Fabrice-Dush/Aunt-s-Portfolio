/** Shared static vector decoration; SVG paths stay outside React hydration. */
export function WaterArt({ kind = 'ribbon', className = '', eager = false }: { kind?: 'ribbon' | 'security'; className?: string; eager?: boolean }) {
  return <img className={`water-art water-${kind} ${className}`} src={`/images/water-${kind}.svg`} width={kind === 'ribbon' ? 1200 : 500} height={kind === 'ribbon' ? 260 : 600} alt="" aria-hidden="true" decoding="async" loading={eager ? 'eager' : 'lazy'} fetchPriority="low" />;
}
