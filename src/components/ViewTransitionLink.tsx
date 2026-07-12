import { forwardRef } from 'react';
import type { MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';

// react-router-dom's own `viewTransition` prop on <Link> only actually does
// anything under a "data router" (createBrowserRouter + <RouterProvider>) —
// the wrapping call to document.startViewTransition() lives entirely inside
// that router's internal state-subscription machinery. This app uses the
// plain <BrowserRouter> + <Routes>/<Route> API, where that prop is silently
// a no-op — there's no code path that ever calls startViewTransition, so no
// transition CSS (see App.css) ever runs, regardless of the prop being set.
// This component wraps react-router's `navigate()` in
// document.startViewTransition() by hand, using flushSync (as react-router
// itself does internally) to force the resulting DOM update to happen
// synchronously inside the transition callback — without that, the browser
// can capture an identical "before" and "after" snapshot since React's
// state update would otherwise land a frame later, silently no-op'ing the
// whole transition.
const ViewTransitionLink = forwardRef<HTMLAnchorElement, LinkProps>(function ViewTransitionLink(
  { to, onClick, ...props },
  ref,
) {
  const navigate = useNavigate();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    // Let the browser handle anything that isn't a plain left-click
    // (new tab, new window, etc.) exactly as it normally would.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    if (!document.startViewTransition) return;

    event.preventDefault();
    document.startViewTransition(() => {
      flushSync(() => navigate(to));
    });
  }

  return <Link ref={ref} to={to} onClick={handleClick} {...props} />;
});

export default ViewTransitionLink;
