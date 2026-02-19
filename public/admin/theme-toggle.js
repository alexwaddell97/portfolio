(function initAdminThemeToggle() {
  const STORAGE_KEY = 'aw-admin-theme';
  const THEME_DARK = 'dark';
  const THEME_LIGHT = 'light';

  function getInitialTheme() {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === THEME_DARK || stored === THEME_LIGHT) {
      return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME_DARK : THEME_LIGHT;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-admin-theme', theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
    window.dispatchEvent(new CustomEvent('aw-admin-theme-change', { detail: { theme } }));

    if (toggleButton) {
      const isDark = theme === THEME_DARK;
      toggleButton.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      toggleButton.innerHTML = `${isDark ? '🌙' : '☀️'} ${isDark ? 'Dark' : 'Light'} Mode`;
    }
  }

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'aw-theme-toggle';
  toggleButton.setAttribute('aria-label', 'Toggle admin theme');

  toggleButton.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-admin-theme') || THEME_LIGHT;
    applyTheme(current === THEME_DARK ? THEME_LIGHT : THEME_DARK);
  });

  document.body.appendChild(toggleButton);
  applyTheme(getInitialTheme());
})();
