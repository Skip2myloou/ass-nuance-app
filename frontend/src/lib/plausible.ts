export function trackEvent(name: string) {
  if (typeof window !== "undefined" && (window as any).plausible) {
    (window as any).plausible(name);
  }
}
