"use client";

import { useState, useEffect } from "react";

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
    <div
      aria-live="polite"
      aria-label="Exemplu de verificare a afirmațiilor"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 300ms ease-out, transform 300ms ease-out",
        background: "var(--color-canvas-elevated, #ffffff)",
        border: "1px solid var(--color-subtle, #e8e6dc)",
        borderRadius: "var(--radius-xl, 24px)",
        padding: "var(--space-8, 32px)",
        boxShadow: "var(--shadow-lg)",
        minHeight: 400,
        width: "100%",
      }}
    >
      {/* Header: pipeline label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2, 8px)",
          marginBottom: "var(--space-5, 20px)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-heading, var(--font-display))",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-mid)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--color-accent)",
              display: "inline-block",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          verificat.xyz
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-heading)",
            fontSize: 11,
            color: "var(--color-mid)",
            letterSpacing: "0.04em",
          }}
        >
          {index + 1} / {DEMO_VERDICTS.length}
        </span>
      </div>

      {/* Claim */}
      <p
        style={{
          fontFamily: "var(--font-body, Lora, Georgia, serif)",
          fontSize: 15,
          fontWeight: 500,
          color: "var(--color-ink)",
          lineHeight: 1.6,
          margin: "0 0 var(--space-6, 24px)",
        }}
      >
        &ldquo;{verdict.claim}&rdquo;
      </p>

      {/* Verdict badge + confidence */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3, 12px)",
          marginBottom: "var(--space-5, 20px)",
        }}
      >
        <span
          role="status"
          aria-label={config.a11yLabel}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: "var(--radius-sm, 6px)",
            background: config.bg,
            color: config.color,
            fontFamily: "var(--font-heading)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          <span aria-hidden="true">{config.icon}</span>
          {config.label}
        </span>

        {/* Confidence */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              flex: 1,
              height: 4,
              background: "var(--color-subtle)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              aria-label={`Scor de încredere: ${verdict.confidence}%`}
              style={{
                height: "100%",
                width: `${verdict.confidence}%`,
                background: config.color,
                borderRadius: 2,
                transition: "width 600ms ease-out",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 12,
              fontWeight: 600,
              color: config.color,
              whiteSpace: "nowrap",
            }}
          >
            {verdict.confidence}%
          </span>
        </div>
      </div>

      {/* Explanation */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "var(--color-ink)",
          lineHeight: 1.65,
          margin: "0 0 var(--space-5, 20px)",
        }}
      >
        {verdict.explanation}
      </p>

      {/* Sources */}
      <div
        style={{
          borderTop: "1px solid var(--color-subtle)",
          paddingTop: "var(--space-4, 16px)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2, 8px)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-mid)",
          }}
        >
          Surse
        </span>
        {verdict.sources.map((source, i) => (
          <a
            key={i}
            href={source.url}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "var(--color-blue, #6a9bcc)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 10 }}>
              ↗
            </span>
            {source.title}
          </a>
        ))}
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
