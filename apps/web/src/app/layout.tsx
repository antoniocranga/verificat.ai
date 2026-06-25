import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { CookieConsentBanner } from "../components/CookieConsentBanner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "verificat.xyz — Real-time Claim Verification Assistant",
  description:
    "Verifică afirmațiile din media în timp real. Un asistent inteligent ce folosește procesare avansată de limbaj natural, căutare semantică și evaluare de încredere a surselor pentru a oferi verdicte clare, explicate și bazate pe dovezi.",
  keywords: [
    "verificare",
    "fact-check",
    "stiri false",
    "dezinformare",
    "romania",
    "real-time",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={`${outfit.variable} ${inter.variable}`}>
      <body className="antialiased bg-[#07090e] text-slate-100 font-sans min-h-screen">
        {children}
        <footer
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '24px',
            textAlign: 'center',
            fontSize: 14,
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
            <a href="/privacy" style={{ color: '#94a3b8', textDecoration: 'underline' }}>
              Politica de Confidențialitate
            </a>
            <a href="/terms" style={{ color: '#94a3b8', textDecoration: 'underline' }}>
              Termeni și Condiții
            </a>
          </div>
          <p style={{ marginTop: 8 }}>© {new Date().getFullYear()} verificat.xyz</p>
        </footer>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
