export function trackEvent(name: string) {
  if (typeof window !== "undefined" && (window as Window & { plausible?: (n: string) => void }).plausible) {
    (window as Window & { plausible?: (n: string) => void }).plausible!(name);
  }
}
