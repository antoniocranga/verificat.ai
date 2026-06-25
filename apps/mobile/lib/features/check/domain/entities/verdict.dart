class Verdict {
  final String id;
  final String claimId;
  final String label;
  final int confidence;
  final String explanation;
  final List<Source> sources;
  final String createdAt;
  final String sessionId;

  const Verdict({
    required this.id,
    required this.claimId,
    required this.label,
    required this.confidence,
    required this.explanation,
    required this.sources,
    required this.createdAt,
    required this.sessionId,
  });

  factory Verdict.fromJson(Map<String, dynamic> json) {
    return Verdict(
      id: json['id'] as String,
      claimId: json['claimId'] as String,
      label: json['label'] as String,
      confidence: (json['confidence'] as num).toInt(),
      explanation: json['explanation'] as String,
      sources: (json['sources'] as List<dynamic>)
          .map((s) => Source.fromJson(s as Map<String, dynamic>))
          .toList(),
      createdAt: json['createdAt'] as String,
      sessionId: json['sessionId'] as String,
    );
  }
}

class Source {
  final String id;
  final String url;
  final String title;
  final int trustScore;
  final String trustScoreExplanation;
  final String retrievedAt;

  const Source({
    required this.id,
    required this.url,
    required this.title,
    required this.trustScore,
    required this.trustScoreExplanation,
    required this.retrievedAt,
  });

  factory Source.fromJson(Map<String, dynamic> json) {
    return Source(
      id: json['id'] as String,
      url: json['url'] as String,
      title: json['title'] as String,
      trustScore: (json['trustScore'] as num).toInt(),
      trustScoreExplanation: json['trustScoreExplanation'] as String,
      retrievedAt: json['retrievedAt'] as String,
    );
  }
}
