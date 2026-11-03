export function Footer({ name }: { name: string }) {
  return <footer className="site-footer"><span className="footer-brand">NS<span>.</span></span><span>© {new Date().getFullYear()} {name.toUpperCase()}</span><span>PHASE 3 DEVELOPMENT FOUNDATION</span></footer>;
}
