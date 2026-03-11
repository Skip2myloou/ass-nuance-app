import AppNav from "@/components/AppNav";
import type { Metadata } from "next";
import "./globals.css";
import { META } from "@/lib/constants";
import AppFooter from "@/components/AppFooter";

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
        <AppNav />

        {/* ── Page content ── */}
        {children}

        {/* ── Footer ── */}
        <AppFooter />
      </body>
    </html>
  );
}
