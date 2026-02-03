const initNoizServerStrip = () => {
  const strip = document.querySelector('.noiz-server-strip');
  if (!strip) {
    return;
  }

  strip.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      strip.scrollBy({ left: event.deltaY, behavior: 'smooth' });
      event.preventDefault();
    }
  }, { passive: false });

  strip.addEventListener('click', (event) => {
    const target = event.target.closest('.noiz-server');
    if (!target) {
      return;
    }

    strip.querySelectorAll('.noiz-server').forEach((server) => {
      server.classList.remove('active');
    });
    target.classList.add('active');
  });
};

const initNoizShellToggles = () => {
  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]');
    if (!action) {
      return;
    }

    if (action.dataset.action === 'toggle-right-panel') {
      document.body.classList.toggle('noiz-right-collapsed');
    }

    if (action.dataset.action === 'toggle-left-rail') {
      document.body.classList.toggle('noiz-left-collapsed');
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initNoizShellToggles();
  initNoizServerStrip();
});
