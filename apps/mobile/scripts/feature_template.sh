#!/bin/bash
# feature_template.sh — Scaffold a Clean Architecture feature module
# Usage: ./scripts/feature_template.sh <feature_name>
# Example: ./scripts/feature_template.sh auth

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <feature_name>"
  exit 1
fi

FEATURE="$1"
BASE="lib/features/$FEATURE"

echo "Scaffolding feature: $FEATURE"

mkdir -p "$BASE/presentation/screens"
mkdir -p "$BASE/presentation/bloc"
mkdir -p "$BASE/domain/entities"
mkdir -p "$BASE/domain/repositories"
mkdir -p "$BASE/domain/usecases"
mkdir -p "$BASE/data/repositories"
mkdir -p "$BASE/data/datasources"
mkdir -p "$BASE/data/models"

# Domain entity
cat > "$BASE/domain/entities/${FEATURE}_entity.dart" <<EOF
class ${FEATURE^}Entity {
  final String id;

  const ${FEATURE^}Entity({required this.id});
}
EOF

# Domain repository interface
cat > "$BASE/domain/repositories/${FEATURE}_repository.dart" <<EOF
abstract class ${FEATURE^}Repository {
  Future<${FEATURE^}Entity> get${FEATURE^}(String id);
}
EOF

# Data model
cat > "$BASE/data/models/${FEATURE}_model.dart" <<EOF
class ${FEATURE^}Model {
  final String id;

  const ${FEATURE^}Model({required this.id});

  factory ${FEATURE^}Model.fromJson(Map<String, dynamic> json) {
    return ${FEATURE^}Model(id: json['id'] as String);
  }

  Map<String, dynamic> toJson() => {'id': id};
}
EOF

# Repository implementation
cat > "$BASE/data/repositories/${FEATURE}_repository_impl.dart" <<EOF
class ${FEATURE^}RepositoryImpl implements ${FEATURE^}Repository {
  @override
  Future<${FEATURE^}Entity> get${FEATURE^}(String id) async {
    // TODO: implement
    throw UnimplementedError();
  }
}
EOF

# BLoC
cat > "$BASE/presentation/bloc/${FEATURE}_bloc.dart" <<EOF
import 'package:flutter_bloc/flutter_bloc.dart';

class ${FEATURE^}Bloc extends Bloc<${FEATURE^}Event, ${FEATURE^}State> {
  ${FEATURE^}Bloc() : super(${FEATURE^}Initial()) {
    on<${FEATURE^}Loaded>(_onLoaded);
  }

  Future<void> _onLoaded(${FEATURE^}Loaded event, Emitter<${FEATURE^}State> emit) async {
    emit(${FEATURE^}Loading());
    try {
      // TODO: fetch data
      emit(${FEATURE^}Success());
    } catch (e) {
      emit(${FEATURE^}Failure(e.toString()));
    }
  }
}

abstract class ${FEATURE^}Event {}

class ${FEATURE^}Loaded extends ${FEATURE^}Event {}

abstract class ${FEATURE^}State {}

class ${FEATURE^}Initial extends ${FEATURE^}State {}

class ${FEATURE^}Loading extends ${FEATURE^}State {}

class ${FEATURE^}Success extends ${FEATURE^}State {}

class ${FEATURE^}Failure extends ${FEATURE^}State {
  final String message;
  ${FEATURE^}Failure(this.message);
}
EOF

# Placeholder screen
cat > "$BASE/presentation/screens/${FEATURE}_screen.dart" <<EOF
import 'package:flutter/material.dart';

class ${FEATURE^}Screen extends StatelessWidget {
  const ${FEATURE^}Screen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('${FEATURE^}')),
      body: const Center(child: Text('${FEATURE^} Screen')),
    );
  }
}
EOF

echo "Done: $FEATURE module scaffolded."
