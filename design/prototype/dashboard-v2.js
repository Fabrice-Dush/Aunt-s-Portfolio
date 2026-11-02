(() => {
  const button = document.querySelector('.side-toggle');
  const sidebar = document.querySelector('#sidebar');
  if (!button || !sidebar) return;
  const setOpen = open => { sidebar.classList.toggle('sidebar-open', open); button.setAttribute('aria-expanded', String(open)); };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  sidebar.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
})();
