export type VerdictLabel =
  | 'True'
  | 'Mostly True'
  | 'Partially True'
  | 'Misleading'
  | 'False'
  | 'Unverified';

export type PipelineStatus =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'verdict-ready'
  | 'error';

export interface Verdict {
  readonly id: string;
  readonly claimId: string;
  readonly label: VerdictLabel;
  readonly confidence: number;
  readonly explanation: string;
  readonly sources: readonly Source[];
  readonly createdAt: string;
  readonly sessionId: string;
}

export interface Claim {
  readonly id: string;
  readonly text: string;
  readonly normalizedText: string;
  readonly detectedAt: string;
  readonly sessionId: string;
  readonly entities: readonly string[];
}

export interface Source {
  readonly id: string;
  readonly url: string;
  readonly title: string;
  readonly trustScore: number;
  readonly trustScoreExplanation: string;
  readonly retrievedAt: string;
}

export interface TrustScore {
  readonly sourceId: string;
  readonly score: number;
  readonly methodology: string;
  readonly computedAt: string;
}

export interface CheckSession {
  readonly id: string;
  readonly userId: string;
  readonly status: PipelineStatus;
  readonly transcript: string;
  readonly startedAt: string;
  readonly completedAt?: string;
}

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly statusCode: number;
}

export interface NotificationPayload {
  readonly type: 'verdict-ready';
  readonly sessionId: string;
  readonly verdictId: string;
  readonly label: VerdictLabel;
}
