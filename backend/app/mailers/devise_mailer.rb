class DeviseMailer < Devise::Mailer
  default from: ENV.fetch("SMTP_FROM", "noreply@kaizendevs.com")

  def reset_password_instructions(record, token, opts = {})
    @token = token
    @resource = record
    @reset_url = "#{frontend_base_url}/reset-password?reset_password_token=#{token}"
    mail(to: record.email, subject: "Reset your Life OS password")
  end

  private

  def frontend_base_url
    opts = Rails.application.config.action_mailer.default_url_options
    URI::Generic.build(scheme: opts[:protocol] || "http", host: opts[:host], port: opts[:port]).to_s
  end
end
