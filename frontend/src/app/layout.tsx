import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nuance Coach",
  description: "AI-assistent voor het interpreteren van datingberichten",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
