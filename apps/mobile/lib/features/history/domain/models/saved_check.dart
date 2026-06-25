class SavedCheck {
  final String id;
  final String? claimText;
  final String? verdict;
  final double? confidenceScore;
  final String savedAt;

  const SavedCheck({
    required this.id,
    this.claimText,
    this.verdict,
    this.confidenceScore,
    required this.savedAt,
  });
}
