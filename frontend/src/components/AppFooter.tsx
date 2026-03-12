"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FOOTER } from "@/lib/constants";

// Pagina's met eigen navbar — globale navbar verbergen
export const HIDE_GLOBAL_NAV_ON = ["/lens", "/lens/landing", "/charge"];

// Pagina's zonder footer
const HIDDEN_ON = ["/lens/landing", "/charge"];

// Per-route tagline
function getTagline(pathname: string): string {
  if (pathname.startsWith("/lens")) return "Van bewustwording naar bewuste keuze.";
  if (pathname.startsWith("/charge")) return "Charge is onderdeel van LiteralPause.";
  return FOOTER.tagline;
}
export const BACK = {
  toHome: "← Terug",
  toCheckin: "← Terug naar check-in",
} as const;

export default function AppFooter() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <footer className="app-footer">
      <span className="app-footer-brand">
        Literal<span>Pause</span>
      </span>
      <span className="app-footer-note">{getTagline(pathname)}</span>
      <Link href="/privacy" className="app-footer-privacy">
        {FOOTER.privacy}
      </Link>
    </footer>
  );
}
