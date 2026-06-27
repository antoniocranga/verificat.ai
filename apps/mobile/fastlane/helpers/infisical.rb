module InfisicalHelper
  INFISICAL_ENV = ENV['INFISICAL_ENV'] || 'staging'

  def self.assert_cli_available!
    `which infisical 2>&1`
    unless $?.success?
      FastlaneCore::UI.user_error!('Infisical CLI is not installed. Install it via: brew install infisical/get-cli/infisical')
    end
  end

  def self.fetch_secrets(env: nil, format: 'json')
    assert_cli_available!
    environment = env || INFISICAL_ENV

    FastlaneCore::UI.message("Fetching secrets from Infisical (#{environment})...")

    output = `infisical secrets get --env=#{environment} --format=json 2>&1`
    unless $?.success?
      FastlaneCore::UI.crash!("Failed to fetch secrets from Infisical (env=#{environment}): #{output}")
    end

    parsed = JSON.parse(output)
    secrets = {}

    if parsed.is_a?(Array)
      parsed.each do |entry|
        secrets[entry['secretKey']] = entry['secretValue']
      end
    elsif parsed.is_a?(Hash)
      secrets = parsed
    end

    FastlaneCore::UI.success("Fetched #{secrets.keys.size} secrets from Infisical")
    secrets
  end
end
