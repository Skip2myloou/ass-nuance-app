"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FOOTER } from "@/lib/constants";

const HIDDEN_ON = ["/lens/landing"];

export default function AppFooter() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <footer className="app-footer">
      <span className="app-footer-brand">
        Literal<span>Pause</span>
      </span>
      <span className="app-footer-note">{FOOTER.tagline}</span>
      <Link href="/privacy" className="app-footer-privacy">
        {FOOTER.privacy}
      </Link>
    </footer>
  );
}
