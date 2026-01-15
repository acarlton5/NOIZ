(() => {
  const rightPanelSlot = document.querySelector('[data-slot="right.panel"]');
  if (window.NoizWidgetStack) {
    window.NoizWidgetStack.mount(rightPanelSlot);
  }
})();
