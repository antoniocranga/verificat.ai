class AppEnv {
  static String get supabaseUrl => const String.fromEnvironment(
        'SUPABASE_URL',
        defaultValue: '',
      );

  static String get supabaseAnonKey => const String.fromEnvironment(
        'SUPABASE_ANON_KEY',
        defaultValue: '',
      );

  static String get apiUrl => const String.fromEnvironment(
        'API_URL',
        defaultValue: 'http://localhost:3000',
      );

  static bool get hasSupabaseConfig =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;
}
