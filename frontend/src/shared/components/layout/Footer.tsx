export function Footer({ name, location }: { name: string; location: string }) {
  return (
    <footer className="site-footer">
      <a className="footer-brand" href="#top" aria-label={`${name} — Back to top`}>NS<span>.</span></a>
      <span>{name}<small>Water Treatment Plant Engineer · {location}</small></span>
      <nav aria-label="Footer navigation"><a href="#about">About</a><a href="#experience">Experience</a><a href="#contact">Contact</a></nav>
    </footer>
  );
}
