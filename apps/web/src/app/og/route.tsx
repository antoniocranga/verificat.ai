import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf9f5",
          fontFamily: "Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient blobs */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 600,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 100% 0%, rgba(217,119,87,0.15) 0%, transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 500,
            height: 350,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 0% 100%, rgba(106,155,204,0.10) 0%, transparent 60%)",
          }}
        />

        {/* Shield icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="72"
          height="72"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d97757"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginBottom: 24 }}
        >
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 0,
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-3px",
              color: "#141413",
              lineHeight: 1,
            }}
          >
            verificat
          </span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-3px",
              color: "#d97757",
              lineHeight: 1,
            }}
          >
            .ai
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 28,
            color: "#b0aea5",
            fontWeight: 400,
            letterSpacing: "-0.5px",
            margin: 0,
            textAlign: "center",
            maxWidth: 640,
            lineHeight: 1.4,
          }}
        >
          Verificare afirmații în timp real
        </p>

        {/* Bottom strip — verdict labels */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 48,
            alignItems: "center",
          }}
        >
          {[
            { label: "Adevărat", color: "#788c5d", bg: "rgba(120,140,93,0.12)" },
            { label: "Parțial adevărat", color: "#b0aea5", bg: "#e8e6dc" },
            { label: "Înșelător", color: "#d97757", bg: "rgba(217,119,87,0.10)" },
            { label: "Fals", color: "#c0392b", bg: "rgba(192,57,43,0.10)" },
            { label: "Neverificat", color: "#b0aea5", bg: "#e8e6dc" },
          ].map(({ label, color, bg }) => (
            <span
              key={label}
              style={{
                padding: "6px 16px",
                borderRadius: 6,
                background: bg,
                color,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
