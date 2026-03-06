import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { META, NAV, FOOTER } from "@/lib/constants";

export const metadata: Metadata = {
  title: META.title,
  description: META.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
        {/* Privacy-friendly analytics by Plausible */}
        <script async src="https://plausible.io/js/pa-arZjc2QzV2x8pVXhHQgQh.js"></script>
        <script dangerouslySetInnerHTML={{ __html: "window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()" }} />
      </head>
      <body>
        {/* ── Nav ── */}
        <nav className="app-nav">
          <Link href="/" className="app-nav-brand">
            Literal<span>Pause</span>
          </Link>
          <div className="app-nav-actions">
            <Link href="/checkin" className="btn btn-ghost btn-sm">
              {NAV.checkin}
            </Link>
            <Link href="/reply" className="btn btn-primary btn-sm">
              {NAV.start}
            </Link>
          </div>
        </nav>

        {/* ── Page content ── */}
        {children}

        {/* ── Footer ── */}
        <footer className="app-footer">
          <span className="app-footer-brand">
            Literal<span>Pause</span>
          </span>
          <span className="app-footer-note">
            {FOOTER.tagline}
          </span>
          <Link href="/privacy" className="app-footer-privacy">
            {FOOTER.privacy}
          </Link>
        </footer>
      </body>
    </html>
  );
}
