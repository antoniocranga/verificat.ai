// Domain entities for the real-time streaming transcript feature.
//
// StreamingVerdict is a 4-value enum matching the streaming WebSocket protocol.
// The full 6-value verdict system (Constitution Article I.2) remains in the
// existing fact-checks domain for the batch flow.

/// 4-value verdict set used in the streaming transcript protocol.
enum StreamingVerdict {
  /// Server confirmed the claim is true.
  verdadero,

  /// Server determined the claim is false.
  falso,

  /// Evidence is partially relevant or contradictory.
  uncertain,

  /// No relevant facts found in the database.
  unverified,
}

/// Parses a server-side verdict string to the local enum.
StreamingVerdict? streamingVerdictFromString(String? s) => switch (s) {
  'TRUE'       => StreamingVerdict.verdadero,
  'FALSE'      => StreamingVerdict.falso,
  'UNCERTAIN'  => StreamingVerdict.uncertain,
  'UNVERIFIED' => StreamingVerdict.unverified,
  _            => null,
};

/// A single spoken utterance with its real-time fact-check result.
class TranscriptSegment {
  final String segmentId;
  final String text;
  final bool isInterim;
  final StreamingVerdict? verdict;
  final double? confidence;
  final String? explanation;
  final List<String> sources;
  final String? matchedFact;
  final int? highlightStart;
  final int? highlightEnd;
  final int? canonicalStart;
  final int? canonicalEnd;
  final String? claimError;

  const TranscriptSegment({
    required this.segmentId,
    required this.text,
    this.isInterim = false,
    this.verdict,
    this.confidence,
    this.explanation,
    this.sources = const [],
    this.matchedFact,
    this.highlightStart,
    this.highlightEnd,
    this.canonicalStart,
    this.canonicalEnd,
    this.claimError,
  });

  /// Returns a copy with the fact-check result applied.
  TranscriptSegment withVerdict({
    required StreamingVerdict? verdict,
    required double? confidence,
    required String? explanation,
    required List<String> sources,
    required String? matchedFact,
    int? highlightStart,
    int? highlightEnd,
    String? claimError,
  }) {
    return TranscriptSegment(
      segmentId: segmentId,
      text: text,
      isInterim: isInterim,
      verdict: verdict,
      confidence: confidence,
      explanation: explanation,
      sources: sources,
      matchedFact: matchedFact,
      highlightStart: highlightStart ?? this.highlightStart,
      highlightEnd: highlightEnd ?? this.highlightEnd,
      canonicalStart: canonicalStart,
      canonicalEnd: canonicalEnd,
      claimError: claimError ?? this.claimError,
    );
  }

  /// True when the segment has a meaningful, displayable verdict.
  bool get hasDisplayVerdict =>
      verdict != null && verdict != StreamingVerdict.unverified;
}
