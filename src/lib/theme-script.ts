/**
 * Theme initialization script to prevent flash of incorrect theme.
 *
 * This runs before React hydration to apply the saved theme immediately.
 * Injected as a blocking script in the document head.
 */
export const themeScript = `
(function() {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.dataset.theme = stored;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
    }
  } catch (e) {
    // localStorage might be blocked
  }
})();
`;
