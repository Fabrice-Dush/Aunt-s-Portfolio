// Runs before styles/React. Stores appearance only; never authentication state.
(() => {
  const scope = /^\/super-admin(?:\/|$)/.test(location.pathname) ? 'operations' : /^\/admin(?:\/|$)/.test(location.pathname) ? 'studio' : 'public';
  let theme = scope === 'operations' ? 'dark' : 'light';
  try {
    const saved = localStorage.getItem('seraphine-appearance-' + scope);
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch { /* Storage can be unavailable in private/restricted browsers. */ }
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
