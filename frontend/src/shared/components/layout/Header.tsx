import { useEffect, useRef, useState } from 'react';
import { Brand } from './Brand';
import type { NavigationLink } from './types';

export function Header({ links }: { links: readonly NavigationLink[] }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const [active, setActive] = useState('');

  useEffect(() => {
    const disclosure = menu.current;
    if (!disclosure) return;
    const desktop = window.matchMedia('(min-width: 961px)');
    const close = () => { disclosure.open = false; };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && disclosure.open) {
        close();
        disclosure.querySelector('summary')?.focus();
      }
    };
    const outside = (event: PointerEvent | FocusEvent) => {
      if (event.target instanceof Node && !disclosure.contains(event.target)) close();
    };
    document.addEventListener('keydown', escape);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    desktop.addEventListener('change', close);
    // A reading band provides active navigation without a continuous scroll listener.
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      const current = entries.find(entry => entry.isIntersecting);
      if (current) setActive(current.target.id === 'hero-title' ? '' : `#${current.target.id}`);
    }, { rootMargin: '-15% 0px -65% 0px' }) : null;
    const hero = document.getElementById('hero-title');
    if (hero) observer?.observe(hero);
    for (const { href } of links) {
      const section = document.getElementById(href.slice(1));
      if (section) observer?.observe(section);
    }
    return () => {
      document.removeEventListener('keydown', escape);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      desktop.removeEventListener('change', close);
      observer?.disconnect();
    };
  }, [links]);

  function select(href: string, mobile: boolean) {
    setActive(href);
    if (mobile && menu.current) {
      menu.current.open = false;
      document.getElementById(href.slice(1))?.focus({ preventScroll: true });
    }
  }

  function navigation(mobile: boolean) {
    return links.map(({ label, href }) => (
      <a key={href} href={href} aria-current={active === href ? 'location' : undefined}
        className={href === '#contact' ? 'nav-contact' : undefined}
        onClick={() => select(href, mobile)}>
        {label}{href === '#contact' && <span aria-hidden="true"> ↗</span>}
      </a>
    ));
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">{navigation(false)}</nav>
        <details className="mobile-menu" ref={menu}>
          <summary className="menu-toggle" aria-controls="mobile-nav">
            <span>Menu</span><span className="menu-lines" aria-hidden="true"><i /><i /></span>
          </summary>
          <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">{navigation(true)}</nav>
        </details>
      </div>
    </header>
  );
}
