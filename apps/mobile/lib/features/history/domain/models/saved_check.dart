class SavedCheck {
  final String id;
  final String? claimText;
  final String? verdict;
  final double? confidenceScore;
  final String savedAt;

  // Session-level fields
  final String? mode; // 'realtime' | 'recording'
  final int? claimCount;
  final Map<String, int>? verdictSummary;
  final String? startedAt;
  final String? endedAt;

  const SavedCheck({
    required this.id,
    this.claimText,
    this.verdict,
    this.confidenceScore,
    required this.savedAt,
    this.mode,
    this.claimCount,
    this.verdictSummary,
    this.startedAt,
    this.endedAt,
  });

  factory SavedCheck.fromSessionJson(Map<String, dynamic> json) {
    return SavedCheck(
      id: json['id'] as String,
      mode: json['mode'] as String?,
      claimCount: json['claimCount'] as int?,
      verdictSummary: (json['verdictSummary'] as Map<String, dynamic>?)
          ?.map((k, v) => MapEntry(k, (v as num).toInt())),
      startedAt: json['startedAt'] as String?,
      endedAt: json['endedAt'] as String?,
      savedAt: json['startedAt'] as String? ?? DateTime.now().toIso8601String(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'claimText': claimText,
    'verdict': verdict,
    'confidenceScore': confidenceScore,
    'savedAt': savedAt,
    'mode': mode,
    'claimCount': claimCount,
    'verdictSummary': verdictSummary,
    'startedAt': startedAt,
    'endedAt': endedAt,
  };
}

class SessionClaim {
  final String id;
  final String text;
  final SessionVerdict? verdict;

  const SessionClaim({
    required this.id,
    required this.text,
    this.verdict,
  });

  factory SessionClaim.fromJson(Map<String, dynamic> json) {
    return SessionClaim(
      id: json['id'] as String,
      text: json['text'] as String,
      verdict: json['verdict'] != null
          ? SessionVerdict.fromJson(json['verdict'] as Map<String, dynamic>)
          : null,
    );
  }
}

class SessionVerdict {
  final String id;
  final String label;
  final double confidence;
  final String explanation;
  final List<SessionSource> sources;

  const SessionVerdict({
    required this.id,
    required this.label,
    required this.confidence,
    required this.explanation,
    required this.sources,
  });

  factory SessionVerdict.fromJson(Map<String, dynamic> json) {
    return SessionVerdict(
      id: json['id'] as String,
      label: json['label'] as String,
      confidence: (json['confidence'] as num).toDouble(),
      explanation: json['explanation'] as String,
      sources: (json['sources'] as List<dynamic>)
          .map((s) => SessionSource.fromJson(s as Map<String, dynamic>))
          .toList(),
    );
  }
}

class SessionSource {
  final String id;
  final String url;
  final String title;
  final double trustScore;

  const SessionSource({
    required this.id,
    required this.url,
    required this.title,
    required this.trustScore,
  });

  factory SessionSource.fromJson(Map<String, dynamic> json) {
    return SessionSource(
      id: json['id'] as String,
      url: json['url'] as String,
      title: json['title'] as String,
      trustScore: (json['trustScore'] as num).toDouble(),
    );
  }
}

class SessionDetail {
  final String id;
  final String mode;
  final String startedAt;
  final String? endedAt;
  final int claimCount;
  final Map<String, int> verdictSummary;
  final List<SessionClaim> claims;

  const SessionDetail({
    required this.id,
    required this.mode,
    required this.startedAt,
    this.endedAt,
    required this.claimCount,
    required this.verdictSummary,
    required this.claims,
  });

  factory SessionDetail.fromJson(Map<String, dynamic> json) {
    return SessionDetail(
      id: json['id'] as String,
      mode: json['mode'] as String,
      startedAt: json['startedAt'] as String,
      endedAt: json['endedAt'] as String?,
      claimCount: (json['claimCount'] as num).toInt(),
      verdictSummary: (json['verdictSummary'] as Map<String, dynamic>)
          .map((k, v) => MapEntry(k, (v as num).toInt())),
      claims: (json['claims'] as List<dynamic>)
          .map((c) => SessionClaim.fromJson(c as Map<String, dynamic>))
          .toList(),
    );
  }
}
