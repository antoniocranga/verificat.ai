class SearchResultEntity {
  final String id;
  final String verdict;
  final double confidenceScore;
  final String explanation;
  final String createdAt;
  final String? claimText;

  const SearchResultEntity({
    required this.id,
    required this.verdict,
    required this.confidenceScore,
    required this.explanation,
    required this.createdAt,
    this.claimText,
  });
}
