import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../history/domain/repositories/saved_checks_repository.dart';
import '../../../history/data/repositories/saved_checks_repository_impl.dart';
import '../bloc/search_bloc.dart';
import '../../domain/entities/search_result_entity.dart';

class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Căutare verificări'),
        actions: [
          IconButton(
            icon: const Icon(Icons.bookmark),
            tooltip: 'Verificări salvate',
            onPressed: () => context.go('/saved'),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: AppTextInput(
              hintText: 'Caută după textul afirmației...',
              onChanged: (value) {
                context.read<SearchBloc>().add(SearchQueryChanged(value));
              },
            ),
          ),
          Expanded(child: BlocBuilder<SearchBloc, SearchState>(
            builder: (context, state) {
              if (state.isLoading) {
                return const Center(child: CircularProgressIndicator());
              }
              if (state.error != null) {
                return Center(
                  child: Text(state.error!, style: const TextStyle(color: Color(0xFFEE0000))),
                );
              }
              if (state.results.isEmpty && state.query.isNotEmpty) {
                return Center(
                  child: Text('Niciun rezultat găsit.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFF4D4D4D))),
                );
              }
              if (state.results.isEmpty) {
                return Center(
                  child: Text('Introduceți un termen de căutare.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFF4D4D4D))),
                );
              }
              return NotificationListener<ScrollNotification>(
                onNotification: (notification) {
                  if (notification is ScrollEndNotification &&
                      notification.metrics.pixels >= notification.metrics.maxScrollExtent - 200) {
                    context.read<SearchBloc>().add(const SearchLoadMore());
                  }
                  return false;
                },
                child: ListView.builder(
                  itemCount: state.results.length + (state.isLoadingMore ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index >= state.results.length) {
                      return const Center(child: Padding(
                        padding: EdgeInsets.all(16),
                        child: CircularProgressIndicator(),
                      ));
                    }
                    return _ResultCard(result: state.results[index]);
                  },
                ),
              );
            },
          )),
        ],
      ),
    );
  }
}

class _ResultCard extends StatefulWidget {
  final SearchResultEntity result;
  const _ResultCard({required this.result});

  @override
  State<_ResultCard> createState() => _ResultCardState();
}

class _ResultCardState extends State<_ResultCard> {
  final SavedChecksRepository _repo = SavedChecksRepositoryImpl();
  bool _isSaved = false;
  bool _loadingSaved = true;

  @override
  void initState() {
    super.initState();
    _checkSaved();
  }

  Future<void> _checkSaved() async {
    final saved = await _repo.isSaved(verdictId: widget.result.id);
    if (mounted) setState(() { _isSaved = saved; _loadingSaved = false; });
  }

  Future<void> _toggleSave() async {
    if (_isSaved) {
      await _repo.remove(verdictId: widget.result.id);
    } else {
      await _repo.save(verdictId: widget.result.id);
    }
    if (mounted) setState(() => _isSaved = !_isSaved);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: AppFeatureCard(
        child: InkWell(
          onTap: () => context.go('/check/${widget.result.id}'),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.result.claimText ?? 'Verificare #${widget.result.id.substring(0, 8)}',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${widget.result.verdict} · ${widget.result.confidenceScore.toStringAsFixed(0)}/100',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(color: const Color(0xFF8F8F8F)),
                    ),
                  ],
                ),
              ),
              if (!_loadingSaved)
                IconButton(
                  icon: Icon(_isSaved ? Icons.bookmark : Icons.bookmark_border, size: 20),
                  onPressed: _toggleSave,
                ),
              const Icon(Icons.chevron_right, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}
