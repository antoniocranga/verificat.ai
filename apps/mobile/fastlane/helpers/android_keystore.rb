require_relative 'infisical'
require 'base64'
require 'tempfile'

module AndroidKeystoreHelper
  KEYSTORE_KEY = 'ANDROID_KEYSTORE_BASE64'.freeze
  KEY_ALIAS_KEY = 'ANDROID_KEY_ALIAS'.freeze
  KEY_PASSWORD_KEY = 'ANDROID_KEY_PASSWORD'.freeze
  KEYSTORE_PASSWORD_KEY = 'ANDROID_KEYSTORE_PASSWORD'.freeze

  def self.load_keystore(env: nil)
    secrets = InfisicalHelper.fetch_secrets(env: env)

    base64 = secrets[KEYSTORE_KEY]
    key_alias = secrets[KEY_ALIAS_KEY]
    key_password = secrets[KEY_PASSWORD_KEY]
    keystore_password = secrets[KEYSTORE_PASSWORD_KEY]

    missing = []
    missing << KEYSTORE_KEY if base64.nil? || base64.empty?
    missing << KEY_ALIAS_KEY if key_alias.nil? || key_alias.empty?
    missing << KEY_PASSWORD_KEY if key_password.nil? || key_password.empty?
    missing << KEYSTORE_PASSWORD_KEY if keystore_password.nil? || keystore_password.empty?

    unless missing.empty?
      FastlaneCore::UI.crash!("Missing Android keystore secrets in Infisical: #{missing.join(', ')}")
    end

    decoded = Base64.decode64(base64)
    tmpfile = Tempfile.new(['android-keystore', '.jks'], '/tmp')
    tmpfile.binmode
    tmpfile.write(decoded)
    tmpfile.close

    ENV['ANDROID_KEYSTORE_PATH'] = tmpfile.path
    ENV['ANDROID_KEY_ALIAS'] = key_alias
    ENV['ANDROID_KEY_PASSWORD'] = key_password
    ENV['ANDROID_KEYSTORE_PASSWORD'] = keystore_password

    FastlaneCore::UI.message("Android keystore written to #{tmpfile.path}")
    tmpfile.path
  end

  def self.cleanup_keystore!(path)
    if path && File.exist?(path)
      File.delete(path)
      FastlaneCore::UI.message("Cleaned up keystore at #{path}")
    end
  end
end
