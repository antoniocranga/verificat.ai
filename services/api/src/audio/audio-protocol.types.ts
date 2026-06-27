/**
 * WebSocket streaming protocol types shared between the audio gateway and clients.
 * All server-to-client messages are JSON; client-to-server audio frames are binary.
 */

/**
 * Simplified 4-value verdict for the real-time streaming transport layer.
 * The full 6-value verdict set (Constitution Article I.2) is preserved in the
 * main fact-checks pipeline; this subset is intentionally scoped to streaming
 * because the UI needs clear, immediate colour signals while speech is live.
 *
 * Mapping from full verdict:
 *   True / Mostly True → TRUE
 *   False / Misleading  → FALSE
 *   Partially True      → UNCERTAIN
 *   Unverified          → UNVERIFIED
 */
export type AudioVerdictValue = 'TRUE' | 'FALSE' | 'UNCERTAIN' | 'UNVERIFIED';

// ---------------------------------------------------------------------------
// Server → Client messages
// ---------------------------------------------------------------------------

/** Interim transcript — display only, never fact-checked */
export interface InterimMessage {
  type: 'interim';
  text: string;
  sessionId: string;
}

/** Final transcript — committed utterance, fact-check pending */
export interface FinalMessage {
  type: 'final';
  segmentId: string;
  text: string;
  sessionId: string;
}

/** Fact-check result, linked to a committed segment via segmentId */
export interface ResultMessage {
  type: 'result';
  segmentId: string;
  verdict: AudioVerdictValue;
  confidence: number;
  explanation: string;
  sources: string[];
  matchedFact: string | null;
}

/** Error notification */
export interface ErrorMessage {
  type: 'error';
  code: string;
  message: string;
}

export type ServerMessage =
  | InterimMessage
  | FinalMessage
  | ResultMessage
  | ErrorMessage;
