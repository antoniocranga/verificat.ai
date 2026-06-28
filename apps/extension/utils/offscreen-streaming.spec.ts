export {};

/**
 * Tests for the real-time streaming additions to the browser extension.
 *
 * Strategy: we test the *logic* that lives outside the browser API boundary —
 * namely the message-dispatch routing, the guessWsType inference, and the
 * PCM conversion arithmetic — without importing the WXT entry-points directly
 * (those depend on `wxt/storage` and `chrome.*` globals that are hard to stub
 * in Jest).  We replicate the pure functions inline so the contract is clear.
 */

// ─── PCM conversion arithmetic ───────────────────────────────────────────────

/**
 * The AudioWorklet processor converts Float32 → Int16 with:
 *   int16[i] = clamp(round(sample * 32768), -32768, 32767)
 */
function float32ToInt16(sample: number): number {
  return Math.max(-32768, Math.min(32767, Math.round(sample * 32768)));
}

describe("PCM Float32 → Int16 conversion", () => {
  it("converts 0.0 → 0", () => {
    expect(float32ToInt16(0.0)).toBe(0);
  });

  it("converts 1.0 → 32767 (clamped positive maximum)", () => {
    expect(float32ToInt16(1.0)).toBe(32767);
  });

  it("converts -1.0 → -32768 (negative minimum)", () => {
    expect(float32ToInt16(-1.0)).toBe(-32768);
  });

  it("converts 0.5 → 16384", () => {
    expect(float32ToInt16(0.5)).toBe(16384);
  });

  it("converts -0.5 → -16384", () => {
    expect(float32ToInt16(-0.5)).toBe(-16384);
  });

  it("clamps values above 1.0 to 32767", () => {
    expect(float32ToInt16(2.0)).toBe(32767);
    expect(float32ToInt16(100.0)).toBe(32767);
  });

  it("clamps values below -1.0 to -32768", () => {
    expect(float32ToInt16(-2.0)).toBe(-32768);
    expect(float32ToInt16(-100.0)).toBe(-32768);
  });

  it("rounds 0.499... correctly (toward nearest integer)", () => {
    // 0.4999 * 32768 ≈ 16380.7232 → round → 16381
    expect(float32ToInt16(0.4999)).toBe(16381);
  });

  it("handles near-silence (very small values)", () => {
    const result = float32ToInt16(0.0001);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(32767);
  });
});

// ─── Message type inference (guessWsType) ────────────────────────────────────

/**
 * Replicates the guessWsType logic from popup/main.ts.
 * The background relay overwrites the original WS `type` field with the
 * relay action name (STREAM_TRANSCRIPT_UPDATE / STREAM_FACT_RESULT).
 * The popup infers the inner WS message type from payload shape.
 */
function guessWsType(msg: Record<string, unknown>): string {
  if (msg["segmentId"] && msg["verdict"]) return "result";
  if (msg["segmentId"] && msg["text"]) return "final";
  if (msg["text"] && !msg["segmentId"]) return "interim";
  return "unknown";
}

describe("guessWsType — streaming message type inference", () => {
  it("identifies interim messages (text only, no segmentId)", () => {
    expect(guessWsType({ text: "Bună ziua" })).toBe("interim");
  });

  it("identifies final messages (segmentId + text)", () => {
    expect(
      guessWsType({ segmentId: "seg-1", text: "Declarație finalizată." }),
    ).toBe("final");
  });

  it("identifies result messages (segmentId + verdict)", () => {
    expect(
      guessWsType({ segmentId: "seg-1", verdict: "TRUE", text: "anything" }),
    ).toBe("result");
  });

  it("returns unknown for empty message", () => {
    expect(guessWsType({})).toBe("unknown");
  });

  it("returns unknown for message with neither text nor segmentId", () => {
    expect(guessWsType({ type: "STREAM_TRANSCRIPT_UPDATE" })).toBe("unknown");
  });

  it("prioritises result when both verdict and text are present", () => {
    expect(
      guessWsType({ segmentId: "seg-2", verdict: "FALSE", text: "Some text" }),
    ).toBe("result");
  });
});

// ─── Streaming verdict label mapping ─────────────────────────────────────────

/**
 * Replicates the popup badge-label mapping used when rendering verdict chips.
 */
function verdictLabel(verdict: string | undefined): string {
  switch (verdict) {
    case "TRUE":
      return "ADEVĂRAT";
    case "FALSE":
      return "FALS";
    case "UNCERTAIN":
      return "INCERT";
    default:
      return "";
  }
}

describe("verdictLabel — Romanian label mapping", () => {
  it("maps TRUE → ADEVĂRAT", () => {
    expect(verdictLabel("TRUE")).toBe("ADEVĂRAT");
  });

  it("maps FALSE → FALS", () => {
    expect(verdictLabel("FALSE")).toBe("FALS");
  });

  it("maps UNCERTAIN → INCERT", () => {
    expect(verdictLabel("UNCERTAIN")).toBe("INCERT");
  });

  it("returns empty string for UNVERIFIED (not shown as badge)", () => {
    expect(verdictLabel("UNVERIFIED")).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(verdictLabel(undefined)).toBe("");
  });
});

// ─── CSS class selection for verdict chips ───────────────────────────────────

/**
 * Replicates the CSS class selection logic from popup/main.ts.
 */
function verdictClass(verdict: string | undefined): string {
  switch (verdict) {
    case "TRUE":
      return "verdict-true";
    case "FALSE":
      return "verdict-false";
    case "UNCERTAIN":
      return "verdict-uncertain";
    default:
      return "";
  }
}

describe("verdictClass — CSS class selection", () => {
  it.each([
    ["TRUE", "verdict-true"],
    ["FALSE", "verdict-false"],
    ["UNCERTAIN", "verdict-uncertain"],
    ["UNVERIFIED", ""],
    [undefined, ""],
  ] as const)("maps %s → %s", (input, expected) => {
    expect(verdictClass(input)).toBe(expected);
  });
});

// ─── Background relay routing ─────────────────────────────────────────────────

type StreamMsg = { type: string; [key: string]: unknown };

/**
 * Replicates the background relay gate: should a message be relayed
 * to content scripts?  Extracts the relay condition from background.ts.
 */
function shouldRelayToContentScripts(msg: StreamMsg): boolean {
  return (
    msg.type === "STREAM_FACT_RESULT" ||
    msg.type === "STREAM_TRANSCRIPT_UPDATE" ||
    msg.type === "STREAM_ERROR"
  );
}

describe("Background relay routing", () => {
  it("relays STREAM_FACT_RESULT to content scripts", () => {
    expect(shouldRelayToContentScripts({ type: "STREAM_FACT_RESULT" })).toBe(
      true,
    );
  });

  it("relays STREAM_TRANSCRIPT_UPDATE to content scripts", () => {
    expect(
      shouldRelayToContentScripts({ type: "STREAM_TRANSCRIPT_UPDATE" }),
    ).toBe(true);
  });

  it("relays STREAM_ERROR to content scripts", () => {
    expect(shouldRelayToContentScripts({ type: "STREAM_ERROR" })).toBe(true);
  });

  it("does not relay GET_STATUS", () => {
    expect(shouldRelayToContentScripts({ type: "GET_STATUS" })).toBe(false);
  });

  it("does not relay VERIFICATION_COMPLETED", () => {
    expect(
      shouldRelayToContentScripts({ type: "VERIFICATION_COMPLETED" }),
    ).toBe(false);
  });

  it("does not relay START_STREAM_MIC", () => {
    expect(shouldRelayToContentScripts({ type: "START_STREAM_MIC" })).toBe(
      false,
    );
  });
});
