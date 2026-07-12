// Resolves once the page loader (if any) has finished its exit — see
// App.tsx and PageLoader.tsx. Kinetic entrance effects that would otherwise
// fire the instant they mount (e.g. ScrambleText) await this first, so they
// aren't hidden behind the loader and instead play out on the page a viewer
// can actually see. Resolves immediately when no loader is shown this session.
let resolveAppReady: () => void;

export const appReady = new Promise<void>((resolve) => {
  resolveAppReady = resolve;
});

export function markAppReady() {
  resolveAppReady();
}
