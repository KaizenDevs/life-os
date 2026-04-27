# frozen_string_literal: true

module ExternalServices
  REGISTRY = {
    smtp_primary: {
      name: "SMTP2GO",
      type: :email,
      provider: "smtp2go",
      host: "mail.smtp2go.com",
      port: 2525,
      env_username: "SMTP2GO_USERNAME",
      env_password: "SMTP2GO_PASSWORD",
      dashboard_url: "https://app.smtp2go.com",
      priority: 1
    },
    smtp_fallback: {
      name: "SendPulse",
      type: :email,
      provider: "sendpulse",
      host: "smtp-pulse.com",
      port: 2525,
      env_username: "SENDPULSE_USERNAME",
      env_password: "SENDPULSE_PASSWORD",
      dashboard_url: "https://sendpulse.com/login",
      priority: 2
    }
  }.freeze

  def self.configured?(key)
    svc = REGISTRY[key]
    return false unless svc
    ENV[svc[:env_username]].present? && ENV[svc[:env_password]].present?
  end

  def self.smtp_settings_for(key)
    svc = REGISTRY[key]
    return nil unless svc && configured?(key)
    {
      address: svc[:host],
      port: svc[:port],
      domain: ENV.fetch("SMTP_DOMAIN", ENV.fetch("APP_HOST", "localhost")),
      user_name: ENV[svc[:env_username]],
      password: ENV[svc[:env_password]],
      authentication: :plain,
      enable_starttls_auto: true
    }
  end

  def self.active_smtp_providers
    REGISTRY.select { |_, v| v[:type] == :email }
            .sort_by { |_, v| v[:priority] }
            .map { |key, svc| { key: key, configured: configured?(key), **svc.except(:env_username, :env_password) } }
  end

  # Returns [[key, name], ...] in priority order — for delivery loops that call smtp_settings_for directly.
  def self.smtp_providers_in_order
    REGISTRY.select { |_, v| v[:type] == :email }
            .sort_by { |_, v| v[:priority] }
            .map { |key, svc| [ key, svc[:name] ] }
  end
end
