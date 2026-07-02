"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@verificat/ui";

type VerdictLabel =
  | "True"
  | "Mostly True"
  | "Partially True"
  | "Misleading"
  | "False"
  | "Unverified";

interface DemoVerdict {
  claim: string;
  label: VerdictLabel;
  confidence: number;
  explanation: string;
  sources: { title: string; url: string }[];
}

const DEMO_VERDICTS: DemoVerdict[] = [
  {
    claim:
      "România a înregistrat cea mai mare creștere economică din UE în ultimul trimestru.",
    label: "Partially True",
    confidence: 71,
    explanation:
      "Creșterea de 2.1% este corectă pentru T3, însă nu este cea mai mare — Polonia a înregistrat 2.4% în același interval.",
    sources: [
      { title: "Eurostat Q3 2024 GDP Report", url: "#" },
      { title: "INS România — Date macroeconomice", url: "#" },
    ],
  },
  {
    claim:
      "Rata inflației din România a scăzut sub media europeană pentru prima oară în zece ani.",
    label: "False",
    confidence: 94,
    explanation:
      "Rata inflației din România a fost de 5.4% în luna raportată, față de media UE de 2.6%. Afirmația nu este susținută de datele Eurostat.",
    sources: [
      { title: "Eurostat — Inflation Statistics", url: "#" },
      { title: "BNR — Raport Inflație Trim. IV", url: "#" },
    ],
  },
  {
    claim:
      "Parlamentul European a votat pentru interzicerea completă a mașinilor pe benzină începând cu 2035.",
    label: "True",
    confidence: 97,
    explanation:
      "Parlamentul European a adoptat regulamentul pe 14 februarie 2023, stabilind că vânzările de autoturisme noi cu motoare termice vor fi interzise din 2035.",
    sources: [
      { title: "Parlamentul European — Comunicat oficial", url: "#" },
      { title: "EUR-Lex — Regulation 2023/851", url: "#" },
    ],
  },
];

const VERDICT_CONFIG: Record<
  VerdictLabel,
  { label: string; color: string; bg: string; icon: string; a11yLabel: string }
> = {
  True: {
    label: "Adevărat",
    color: "var(--color-verdict-true, #788c5d)",
    bg: "var(--color-green-soft, rgba(120,140,93,0.12))",
    icon: "✓",
    a11yLabel: "Verdict: Adevărat",
  },
  "Mostly True": {
    label: "Predominant adevărat",
    color: "var(--color-verdict-mostly-true, #788c5d)",
    bg: "var(--color-green-soft, rgba(120,140,93,0.12))",
    icon: "✓",
    a11yLabel: "Verdict: Predominant adevărat",
  },
  "Partially True": {
    label: "Parțial adevărat",
    color: "var(--color-verdict-partial, #b0aea5)",
    bg: "var(--color-subtle, #e8e6dc)",
    icon: "◑",
    a11yLabel: "Verdict: Parțial adevărat",
  },
  Misleading: {
    label: "Înșelător",
    color: "var(--color-verdict-misleading, #d97757)",
    bg: "var(--color-accent-soft, rgba(217,119,87,0.10))",
    icon: "⚠",
    a11yLabel: "Verdict: Înșelător",
  },
  False: {
    label: "Fals",
    color: "var(--color-verdict-false, #c0392b)",
    bg: "rgba(192,57,43,0.10)",
    icon: "✗",
    a11yLabel: "Verdict: Fals",
  },
  Unverified: {
    label: "Neverificat",
    color: "var(--color-verdict-unverified, #b0aea5)",
    bg: "var(--color-subtle, #e8e6dc)",
    icon: "?",
    a11yLabel: "Verdict: Neverificat",
  },
};

export function DemoVerdictCard() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % DEMO_VERDICTS.length);
        setVisible(true);
      }, 350);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const verdict = DEMO_VERDICTS[index];
  const config = VERDICT_CONFIG[verdict.label];

  return (
    <Card
      aria-live="polite"
      aria-label="Exemplu de verificare a afirmațiilor"
      className={`min-h-[400px] w-full transition-all duration-300 ease-out shadow-lg ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[6px]"
      }`}
    >
      <CardHeader className="pb-4">
        {/* Header: pipeline label */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-heading text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-[pulse-dot_2s_ease-in-out_infinite]" />
            verificat.xyz
          </span>
          <span className="ml-auto font-heading text-[11px] text-muted-foreground tracking-wide">
            {index + 1} / {DEMO_VERDICTS.length}
          </span>
        </div>

        {/* Claim */}
        <p className="font-body text-[15px] font-medium text-foreground leading-relaxed mt-5">
          &ldquo;{verdict.claim}&rdquo;
        </p>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Verdict badge + confidence */}
        <div className="flex items-center gap-3 mb-5">
          <span
            role="status"
            aria-label={config.a11yLabel}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-heading text-[13px] font-semibold tracking-tight"
            style={{ background: config.bg, color: config.color }}
          >
            <span aria-hidden="true">{config.icon}</span>
            {config.label}
          </span>

          {/* Confidence */}
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1 bg-muted rounded-sm overflow-hidden">
              <div
                aria-label={`Scor de încredere: ${verdict.confidence}%`}
                className="h-full rounded-sm transition-all duration-700 ease-out"
                style={{ width: `${verdict.confidence}%`, background: config.color }}
              />
            </div>
            <span
              className="font-heading text-[12px] font-semibold whitespace-nowrap"
              style={{ color: config.color }}
            >
              {verdict.confidence}%
            </span>
          </div>
        </div>

        {/* Explanation */}
        <p className="font-body text-[13px] text-foreground leading-relaxed m-0">
          {verdict.explanation}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-2 pt-4 border-t border-border mt-1">
        <span className="font-heading text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
          Surse
        </span>
        <div className="flex flex-col gap-2 w-full">
          {verdict.sources.map((source, i) => (
            <a
              key={i}
              href={source.url}
              className="font-body text-[12px] no-underline flex items-center gap-1"
              style={{ color: "var(--color-blue, #6a9bcc)" }}
            >
              <span aria-hidden="true" className="text-[10px]">
                ↗
              </span>
              {source.title}
            </a>
          ))}
        </div>
      </CardFooter>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </Card>
  );
}
