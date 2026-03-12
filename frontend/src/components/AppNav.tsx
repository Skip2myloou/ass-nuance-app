"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/constants";

// Routes met eigen navbar
const HIDE_ON = ["/lens", "/lens/landing", "/charge"];

export default function AppNav() {
  const pathname = usePathname();
  if (HIDE_ON.some(route => pathname.startsWith(route))) return null;

  return (
    <nav className="app-nav">
      <Link href="/" className="app-nav-brand">
        Literal<span>Pause</span>
      </Link>
      <div className="app-nav-actions">
        <Link href="/reply" className="btn btn-primary btn-sm">
          {NAV.start}
        </Link>
      </div>
    </nav>
  );
}
