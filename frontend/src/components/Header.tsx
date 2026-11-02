import { useEffect, useState } from 'react';
import { Brand } from './Brand';

const links = [
  ['About', '#about'],
  ['Expertise', '#expertise'],
  ['Experience', '#experience'],
  ['Education', '#education'],
  ['Projects', '#projects'],
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <header className="site-header" id="top">
      <div className="header-inner">
        <Brand />
        <button
          type="button"
          className="menu-toggle"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span /><span /><span />
        </button>
        <nav className={`site-nav ${open ? 'is-open' : ''}`} id="primary-nav" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <a className="nav-contact" href="#contact" onClick={() => setOpen(false)}>Get in touch <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
    </header>
  );
}
