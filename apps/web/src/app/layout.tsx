import type { Metadata } from "next";
import "./globals.css";
import { CookieConsentBanner } from "../components/CookieConsentBanner";

export const metadata: Metadata = {
  metadataBase: new URL("https://staging.verificat.xyz"),
  title: "verificat.xyz — Verificare afirmații în timp real",
  description:
    "Verifică afirmațiile din media în timp real. Un asistent inteligent ce folosește procesare avansată de limbaj natural, căutare semantică și evaluare de încredere a surselor pentru a oferi verdicte clare, explicate și bazate pe dovezi.",
  keywords: [
    "verificare",
    "fact-check",
    "știri false",
    "dezinformare",
    "românia",
    "real-time",
  ],
  openGraph: {
    title: "verificat.xyz — Verificare afirmații în timp real",
    description:
      "Verifică afirmațiile din media în timp real cu verdicte clare, explicate și bazate pe dovezi.",
    images: [{ url: "/og", width: 1200, height: 630 }],
    locale: "ro_RO",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  other: {
    "theme-color": "#f5f4ed",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className="antialiased grain-overlay min-h-screen">
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
