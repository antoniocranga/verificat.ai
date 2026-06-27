import 'package:flutter_test/flutter_test.dart';
import 'package:verificat_mobile/features/listening/domain/entities/transcript_segment.dart';

void main() {
  // ─── StreamingVerdict enum parsing ────────────────────────────────────────

  group('streamingVerdictFromString', () {
    test('parses TRUE → verdadero', () {
      expect(streamingVerdictFromString('TRUE'), StreamingVerdict.verdadero);
    });

    test('parses FALSE → falso', () {
      expect(streamingVerdictFromString('FALSE'), StreamingVerdict.falso);
    });

    test('parses UNCERTAIN → uncertain', () {
      expect(streamingVerdictFromString('UNCERTAIN'), StreamingVerdict.uncertain);
    });

    test('parses UNVERIFIED → unverified', () {
      expect(streamingVerdictFromString('UNVERIFIED'), StreamingVerdict.unverified);
    });

    test('returns null for unknown strings', () {
      expect(streamingVerdictFromString('MAYBE'), isNull);
      expect(streamingVerdictFromString(''), isNull);
    });

    test('returns null for null input', () {
      expect(streamingVerdictFromString(null), isNull);
    });

    test('is case-sensitive — lowercase "true" returns null', () {
      expect(streamingVerdictFromString('true'), isNull);
    });
  });

  // ─── TranscriptSegment construction ──────────────────────────────────────

  group('TranscriptSegment defaults', () {
    test('isInterim defaults to false', () {
      const seg = TranscriptSegment(
        segmentId: 'seg-1',
        text: 'Test',
      );
      expect(seg.isInterim, isFalse);
    });

    test('verdict defaults to null', () {
      const seg = TranscriptSegment(segmentId: 'seg-2', text: 'Text');
      expect(seg.verdict, isNull);
    });

    test('sources defaults to empty list', () {
      const seg = TranscriptSegment(segmentId: 'seg-3', text: 'Text');
      expect(seg.sources, isEmpty);
    });
  });

  // ─── hasDisplayVerdict ────────────────────────────────────────────────────

  group('hasDisplayVerdict', () {
    test('is false when verdict is null', () {
      const seg = TranscriptSegment(segmentId: 's', text: 'T');
      expect(seg.hasDisplayVerdict, isFalse);
    });

    test('is false for UNVERIFIED', () {
      const seg = TranscriptSegment(
        segmentId: 's',
        text: 'T',
        verdict: StreamingVerdict.unverified,
      );
      expect(seg.hasDisplayVerdict, isFalse);
    });

    test('is true for verdadero (TRUE)', () {
      const seg = TranscriptSegment(
        segmentId: 's',
        text: 'T',
        verdict: StreamingVerdict.verdadero,
      );
      expect(seg.hasDisplayVerdict, isTrue);
    });

    test('is true for falso (FALSE)', () {
      const seg = TranscriptSegment(
        segmentId: 's',
        text: 'T',
        verdict: StreamingVerdict.falso,
      );
      expect(seg.hasDisplayVerdict, isTrue);
    });

    test('is true for uncertain', () {
      const seg = TranscriptSegment(
        segmentId: 's',
        text: 'T',
        verdict: StreamingVerdict.uncertain,
      );
      expect(seg.hasDisplayVerdict, isTrue);
    });
  });

  // ─── withVerdict ──────────────────────────────────────────────────────────

  group('withVerdict', () {
    const base = TranscriptSegment(
      segmentId: 'seg-base',
      text: 'România are o populație mare.',
      isInterim: false,
    );

    test('applies verdict fields to a copy', () {
      final updated = base.withVerdict(
        verdict: StreamingVerdict.verdadero,
        confidence: 0.87,
        explanation: 'Confirmat de INS.',
        sources: ['https://insse.ro'],
        matchedFact: 'Populația României este de ~19 milioane.',
      );

      expect(updated.verdict, StreamingVerdict.verdadero);
      expect(updated.confidence, closeTo(0.87, 1e-6));
      expect(updated.explanation, 'Confirmat de INS.');
      expect(updated.sources, contains('https://insse.ro'));
      expect(updated.matchedFact, 'Populația României este de ~19 milioane.');
    });

    test('preserves segmentId and text in the copy', () {
      final updated = base.withVerdict(
        verdict: StreamingVerdict.falso,
        confidence: 0.9,
        explanation: 'Contrazis de date.',
        sources: [],
        matchedFact: null,
      );

      expect(updated.segmentId, base.segmentId);
      expect(updated.text, base.text);
    });

    test('sets isInterim to false in the result', () {
      final updated = base.withVerdict(
        verdict: StreamingVerdict.uncertain,
        confidence: 0.5,
        explanation: 'Dovezi contradictorii.',
        sources: [],
        matchedFact: null,
      );

      expect(updated.isInterim, isFalse);
    });

    test('does not mutate the original segment', () {
      base.withVerdict(
        verdict: StreamingVerdict.falso,
        confidence: 0.75,
        explanation: 'Fals confirmat.',
        sources: [],
        matchedFact: null,
      );

      expect(base.verdict, isNull);
    });
  });
}
