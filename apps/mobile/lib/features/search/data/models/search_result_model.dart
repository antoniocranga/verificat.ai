import '../../domain/entities/search_result_entity.dart';

class SearchResultModel {
  final String id;
  final String verdict;
  final double confidenceScore;
  final String explanation;
  final String createdAt;
  final String? claimText;

  const SearchResultModel({
    required this.id,
    required this.verdict,
    required this.confidenceScore,
    required this.explanation,
    required this.createdAt,
    this.claimText,
  });

  factory SearchResultModel.fromJson(Map<String, dynamic> json) {
    return SearchResultModel(
      id: json['id'] as String,
      verdict: json['verdict'] as String,
      confidenceScore: (json['confidenceScore'] as num).toDouble(),
      explanation: json['explanation'] as String,
      createdAt: json['createdAt'] as String,
      claimText: (json['claim'] as Map<String, dynamic>?)?['text'] as String?,
    );
  }

  SearchResultEntity toEntity() => SearchResultEntity(
    id: id,
    verdict: verdict,
    confidenceScore: confidenceScore,
    explanation: explanation,
    createdAt: createdAt,
    claimText: claimText,
  );
}
