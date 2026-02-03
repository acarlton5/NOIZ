const COMPONENT_CACHE = new Map();

const loadComponent = async (path) => {
  if (COMPONENT_CACHE.has(path)) {
    return COMPONENT_CACHE.get(path);
  }

  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  const html = await response.text();
  COMPONENT_CACHE.set(path, html);
  return html;
};

const setActiveNavigationItem = (root) => {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const links = root.querySelectorAll('.menu-item-link');

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) {
      return;
    }

    if (href === currentPath) {
      const menuItem = link.closest('.menu-item');
      if (menuItem) {
        menuItem.classList.add('active');
      }
    }
  });
};

const hydrateNavigationWidgets = async () => {
  const placeholders = document.querySelectorAll('[data-component="navigation-widgets"]');
  if (!placeholders.length) {
    return;
  }

  try {
    const html = await loadComponent('components/navigation-widgets.html');
    placeholders.forEach((placeholder) => {
      placeholder.outerHTML = html;
    });

    document.querySelectorAll('.navigation-widget, .navigation-widget-mobile, .navigation-widget-small')
      .forEach((widget) => setActiveNavigationItem(widget));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  hydrateNavigationWidgets();
});
