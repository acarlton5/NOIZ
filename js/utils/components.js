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
  const links = root.querySelectorAll('.menu-item-link, .noiz-rail__item');

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) {
      return;
    }

    if (href === currentPath) {
      const menuItem = link.closest('.menu-item') || link.closest('.noiz-rail__item');
      if (menuItem) {
        menuItem.classList.add('active');
      }
    }
  });
};

const hydrateComponents = async (root = document) => {
  const placeholders = Array.from(root.querySelectorAll('[data-component]'));
  if (!placeholders.length) {
    return;
  }

  try {
    await Promise.all(placeholders.map(async (placeholder) => {
      const name = placeholder.getAttribute('data-component');
      if (!name) {
        return;
      }
      const html = await loadComponent(`components/${name}.html`);
      placeholder.outerHTML = html;
    }));

    document.querySelectorAll('.navigation-widget, .navigation-widget-mobile, .navigation-widget-small, .noiz-left-rail')
      .forEach((widget) => setActiveNavigationItem(widget));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  await hydrateComponents();
  await hydrateComponents();
});
