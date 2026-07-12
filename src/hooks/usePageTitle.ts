import { useEffect } from 'react';

// Home already carries the site-wide default title/meta set in index.html
// (it's what a fresh load or a crawler sees first). Every other route needs
// this so at least the browser tab — and anyone re-sharing the tab's title —
// doesn't just say "Alex Waddell" for every page on the site.
export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} | alexw.dev`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
