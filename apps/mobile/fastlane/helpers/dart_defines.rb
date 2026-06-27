require_relative 'infisical'

module DartDefinesHelper
  MANIFEST_PATH = File.join(__dir__, '..', 'DART_DEFINES.md')
  DART_DEFINES_FILE = File.join(File.dirname(__FILE__), '..', '..', '.dart_defines.json')

  REQUIRED_KEYS = %w[
    SUPABASE_URL
    SUPABASE_ANON_KEY
    API_URL
  ].freeze

  def self.fetch_dart_defines(env: nil)
    InfisicalHelper.assert_cli_available!

    environment = env || InfisicalHelper::INFISICAL_ENV
    secrets = InfisicalHelper.fetch_secrets(env: environment)

    missing = REQUIRED_KEYS.select { |k| secrets[k].nil? || secrets[k].empty? }
    unless missing.empty?
      FastlaneCore::UI.crash!(
        "Missing required dart-define keys in Infisical (#{environment}): #{missing.join(', ')}. " \
        "Add them to Infisical before building."
      )
    end

    selected = {}
    REQUIRED_KEYS.each { |k| selected[k] = secrets[k] }

    File.write(DART_DEFINES_FILE, JSON.pretty_generate(selected))
    FastlaneCore::UI.message("Wrote #{REQUIRED_KEYS.size} dart-defines to #{DART_DEFINES_FILE}")

    DART_DEFINES_FILE
  end

  def self.cleanup_dart_defines!
    if File.exist?(DART_DEFINES_FILE)
      File.delete(DART_DEFINES_FILE)
      FastlaneCore::UI.message("Cleaned up #{DART_DEFINES_FILE}")
    end
  end
end
