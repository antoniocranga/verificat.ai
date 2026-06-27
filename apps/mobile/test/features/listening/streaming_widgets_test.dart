import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:verificat_mobile/features/listening/domain/entities/transcript_segment.dart';
import 'package:verificat_mobile/features/listening/presentation/widgets/verdict_badge.dart';
import 'package:verificat_mobile/features/listening/presentation/widgets/explanation_sheet.dart';
import 'package:verificat_mobile/features/listening/presentation/widgets/transcript_view.dart';
import 'package:verificat_mobile/features/listening/data/services/transcript_stream_service.dart';
import 'package:verificat_mobile/core/theme/app_colors.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Test helpers
// ─────────────────────────────────────────────────────────────────────────────

Widget _wrap(Widget child) => MaterialApp(home: Scaffold(body: child));

/// A stub TranscriptStreamService that exposes segment state without
/// opening any real network or audio connections.
class _FakeStreamService extends TranscriptStreamService {
  final List<TranscriptSegment> _fakeSegments;
  final String _fakeInterim;

  _FakeStreamService({
    List<TranscriptSegment> segments = const [],
    String interimText = '',
  })  : _fakeSegments = segments,
        _fakeInterim = interimText;

  @override
  List<TranscriptSegment> get segments => _fakeSegments;

  @override
  String get interimText => _fakeInterim;

  @override
  bool get isRecording => false;
}

Widget _withFakeService(Widget child, _FakeStreamService service) {
  return ChangeNotifierProvider<TranscriptStreamService>.value(
    value: service,
    child: MaterialApp(home: Scaffold(body: child)),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StreamingVerdictBadge tests
// ─────────────────────────────────────────────────────────────────────────────

void main() {
  group('StreamingVerdictBadge', () {
    testWidgets('shows ADEVĂRAT for verdadero', (tester) async {
      await tester.pumpWidget(
        _wrap(const StreamingVerdictBadge(verdict: StreamingVerdict.verdadero)),
      );
      expect(find.text('ADEVĂRAT'), findsOneWidget);
    });

    testWidgets('shows FALS for falso', (tester) async {
      await tester.pumpWidget(
        _wrap(const StreamingVerdictBadge(verdict: StreamingVerdict.falso)),
      );
      expect(find.text('FALS'), findsOneWidget);
    });

    testWidgets('shows INCERT for uncertain', (tester) async {
      await tester.pumpWidget(
        _wrap(const StreamingVerdictBadge(verdict: StreamingVerdict.uncertain)),
      );
      expect(find.text('INCERT'), findsOneWidget);
    });

    testWidgets('shows NEVERIFICAT for unverified', (tester) async {
      await tester.pumpWidget(
        _wrap(const StreamingVerdictBadge(verdict: StreamingVerdict.unverified)),
      );
      expect(find.text('NEVERIFICAT'), findsOneWidget);
    });

    testWidgets('renders nothing for null verdict', (tester) async {
      await tester.pumpWidget(
        _wrap(const StreamingVerdictBadge(verdict: null)),
      );
      // SizedBox.shrink — no text visible
      expect(find.text('ADEVĂRAT'), findsNothing);
      expect(find.text('FALS'), findsNothing);
    });

    testWidgets('uses green background for verdadero', (tester) async {
      await tester.pumpWidget(
        _wrap(const StreamingVerdictBadge(verdict: StreamingVerdict.verdadero)),
      );
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, AppColors.verdictTrue);
    });

    testWidgets('uses red background for falso', (tester) async {
      await tester.pumpWidget(
        _wrap(const StreamingVerdictBadge(verdict: StreamingVerdict.falso)),
      );
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, AppColors.verdictFalse);
    });
  });

  // ─── ExplanationSheet tests ────────────────────────────────────────────────

  group('ExplanationSheet', () {
    const segBase = TranscriptSegment(
      segmentId: 'seg-1',
      text: 'România este membră a Uniunii Europene.',
      verdict: StreamingVerdict.verdadero,
      confidence: 0.91,
      explanation: 'Confirmat de Tratatul de Aderare din 2007.',
      sources: ['https://europa.eu'],
      matchedFact: 'România a aderat la UE în 2007.',
    );

    testWidgets('renders the quoted claim text', (tester) async {
      await tester.pumpWidget(_wrap(const ExplanationSheet(segment: segBase)));
      expect(find.textContaining('România este membră'), findsOneWidget);
    });

    testWidgets('renders the explanation text', (tester) async {
      await tester.pumpWidget(_wrap(const ExplanationSheet(segment: segBase)));
      expect(find.text('Confirmat de Tratatul de Aderare din 2007.'), findsOneWidget);
    });

    testWidgets('renders the matched fact', (tester) async {
      await tester.pumpWidget(_wrap(const ExplanationSheet(segment: segBase)));
      expect(find.text('România a aderat la UE în 2007.'), findsOneWidget);
    });

    testWidgets('renders source URLs', (tester) async {
      await tester.pumpWidget(_wrap(const ExplanationSheet(segment: segBase)));
      expect(find.textContaining('europa.eu'), findsOneWidget);
    });

    testWidgets('renders the verdict badge', (tester) async {
      await tester.pumpWidget(_wrap(const ExplanationSheet(segment: segBase)));
      expect(find.byType(StreamingVerdictBadge), findsOneWidget);
    });

    testWidgets('renders confidence percentage', (tester) async {
      await tester.pumpWidget(_wrap(const ExplanationSheet(segment: segBase)));
      expect(find.textContaining('91%'), findsOneWidget);
    });

    testWidgets('hides matched fact section when matchedFact is null', (tester) async {
      const seg = TranscriptSegment(
        segmentId: 'seg-2',
        text: 'Test.',
        verdict: StreamingVerdict.falso,
        matchedFact: null,
      );
      await tester.pumpWidget(_wrap(const ExplanationSheet(segment: seg)));
      expect(find.text('FAPT VERIFICAT'), findsNothing);
    });

    testWidgets('hides sources section when sources list is empty', (tester) async {
      const seg = TranscriptSegment(
        segmentId: 'seg-3',
        text: 'Test.',
        verdict: StreamingVerdict.uncertain,
        sources: [],
      );
      await tester.pumpWidget(_wrap(const ExplanationSheet(segment: seg)));
      expect(find.text('SURSE'), findsNothing);
    });
  });

  // ─── TranscriptView tests ──────────────────────────────────────────────────

  group('TranscriptView', () {
    testWidgets('renders committed segment text', (tester) async {
      final service = _FakeStreamService(
        segments: [
          const TranscriptSegment(
            segmentId: 'seg-1',
            text: 'Declarație importantă despre economie.',
          ),
        ],
      );

      await tester.pumpWidget(_withFakeService(const TranscriptView(), service));
      await tester.pumpAndSettle();

      expect(find.text('Declarație importantă despre economie.'), findsOneWidget);
    });

    testWidgets('renders interim text in the list', (tester) async {
      final service = _FakeStreamService(
        interimText: 'Text provizoriu...',
      );

      await tester.pumpWidget(_withFakeService(const TranscriptView(), service));
      await tester.pump();

      expect(find.text('Text provizoriu...'), findsOneWidget);
    });

    testWidgets('renders verdict badge for highlighted segments', (tester) async {
      final service = _FakeStreamService(
        segments: [
          const TranscriptSegment(
            segmentId: 'seg-v',
            text: 'Afirmație verificată.',
            verdict: StreamingVerdict.verdadero,
            confidence: 0.9,
          ),
        ],
      );

      await tester.pumpWidget(_withFakeService(const TranscriptView(), service));
      await tester.pumpAndSettle();

      expect(find.byType(StreamingVerdictBadge), findsOneWidget);
    });

    testWidgets('does not show badge for unverified segments', (tester) async {
      final service = _FakeStreamService(
        segments: [
          const TranscriptSegment(
            segmentId: 'seg-u',
            text: 'Afirmație neverificată.',
            verdict: StreamingVerdict.unverified,
          ),
        ],
      );

      await tester.pumpWidget(_withFakeService(const TranscriptView(), service));
      await tester.pumpAndSettle();

      // hasDisplayVerdict is false for unverified → badge not shown
      expect(find.byType(StreamingVerdictBadge), findsNothing);
    });

    testWidgets('renders multiple segments', (tester) async {
      final service = _FakeStreamService(
        segments: [
          const TranscriptSegment(segmentId: 's1', text: 'Prima propoziție.'),
          const TranscriptSegment(segmentId: 's2', text: 'A doua propoziție.'),
          const TranscriptSegment(segmentId: 's3', text: 'A treia propoziție.'),
        ],
      );

      await tester.pumpWidget(_withFakeService(const TranscriptView(), service));
      await tester.pumpAndSettle();

      expect(find.text('Prima propoziție.'), findsOneWidget);
      expect(find.text('A doua propoziție.'), findsOneWidget);
      expect(find.text('A treia propoziție.'), findsOneWidget);
    });

    testWidgets('tapping a highlighted segment opens ExplanationSheet', (tester) async {
      final service = _FakeStreamService(
        segments: [
          const TranscriptSegment(
            segmentId: 'seg-tap',
            text: 'Afirmație cu verdict.',
            verdict: StreamingVerdict.falso,
            explanation: 'Explicație detaliată.',
          ),
        ],
      );

      await tester.pumpWidget(_withFakeService(const TranscriptView(), service));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Afirmație cu verdict.'));
      await tester.pumpAndSettle();

      expect(find.byType(ExplanationSheet), findsOneWidget);
    });

    testWidgets('tapping a non-highlighted segment does not open ExplanationSheet',
        (tester) async {
      final service = _FakeStreamService(
        segments: [
          const TranscriptSegment(
            segmentId: 'seg-noop',
            text: 'Segment fără verdict.',
          ),
        ],
      );

      await tester.pumpWidget(_withFakeService(const TranscriptView(), service));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Segment fără verdict.'));
      await tester.pumpAndSettle();

      expect(find.byType(ExplanationSheet), findsNothing);
    });
  });

  // ─── AppColors streaming helpers ───────────────────────────────────────────

  group('AppColors streaming verdict helpers', () {
    test('streamingVerdictBg returns verdictTrue tint for verdadero', () {
      final color = AppColors.streamingVerdictBg(StreamingVerdict.verdadero);
      expect(color, isNotNull);
      // Should be a transparent version of verdictTrue (not fully transparent)
      expect(color.a, lessThan(1.0));
    });

    test('streamingVerdictFg returns verdictTrue for verdadero', () {
      expect(
        AppColors.streamingVerdictFg(StreamingVerdict.verdadero),
        AppColors.verdictTrue,
      );
    });

    test('streamingVerdictFg returns verdictFalse for falso', () {
      expect(
        AppColors.streamingVerdictFg(StreamingVerdict.falso),
        AppColors.verdictFalse,
      );
    });

    test('streamingVerdictFg returns ink for null', () {
      expect(AppColors.streamingVerdictFg(null), AppColors.ink);
    });

    test('streamingVerdictLabel returns Romanian string for verdadero', () {
      expect(AppColors.streamingVerdictLabel(StreamingVerdict.verdadero), 'ADEVĂRAT');
    });

    test('streamingVerdictLabel returns Romanian string for falso', () {
      expect(AppColors.streamingVerdictLabel(StreamingVerdict.falso), 'FALS');
    });

    test('streamingVerdictLabel returns empty string for null', () {
      expect(AppColors.streamingVerdictLabel(null), '');
    });
  });
}
