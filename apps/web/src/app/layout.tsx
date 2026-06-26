import type { Metadata } from "next";
import { Poppins, Lora } from "next/font/google";
import "./globals.css";
import { CookieConsentBanner } from "../components/CookieConsentBanner";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={`${poppins.variable} ${lora.variable}`}>
      <body className="antialiased grain-overlay min-h-screen">
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
