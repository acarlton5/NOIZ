(() => {
  const widgetMarkup = `
    <div class="noiz-widget-stack" data-module="widget-stack">
      <div class="noiz-widget">
        <div class="noiz-widget-header">
          <h3 class="noiz-widget-title">Widget Settings</h3>
          <a class="noiz-widget-action" href="#">Manage</a>
        </div>
        <ul class="noiz-widget-list">
          <li class="noiz-widget-item">
            <span>Profile Visibility</span>
            <span class="noiz-widget-badge">Public</span>
          </li>
          <li class="noiz-widget-item">
            <span>Profile Themes</span>
            <span class="noiz-widget-badge">4 Active</span>
          </li>
          <li class="noiz-widget-item">
            <span>Quick Replies</span>
            <span class="noiz-widget-badge">12</span>
          </li>
        </ul>
      </div>
      <div class="noiz-widget">
        <div class="noiz-widget-header">
          <h3 class="noiz-widget-title">Account Status</h3>
          <a class="noiz-widget-action" href="#">Update</a>
        </div>
        <ul class="noiz-widget-list">
          <li class="noiz-widget-item">
            <span>Verification</span>
            <span class="noiz-widget-badge">Complete</span>
          </li>
          <li class="noiz-widget-item">
            <span>Storage Used</span>
            <span class="noiz-widget-badge">68%</span>
          </li>
          <li class="noiz-widget-item">
            <span>Support Tier</span>
            <span class="noiz-widget-badge">Plus</span>
          </li>
        </ul>
      </div>
    </div>
  `;

  window.NoizWidgetStack = {
    mount(target) {
      if (!target) {
        return;
      }
      target.innerHTML = widgetMarkup;
    }
  };
})();
