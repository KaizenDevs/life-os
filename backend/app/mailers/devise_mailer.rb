class DeviseMailer < Devise::Mailer
  def reset_password_instructions(record, token, opts = {})
    @token = token
    @resource = record
    @reset_url = "#{frontend_base_url}/reset-password?reset_password_token=#{token}"
    mail(to: record.email, subject: "Reset your Life OS password")
  end

  private

  def frontend_base_url
    host = Rails.application.config.action_mailer.default_url_options[:host]
    protocol = Rails.application.config.action_mailer.default_url_options[:protocol] || "http"
    port = Rails.application.config.action_mailer.default_url_options[:port]
    port ? "#{protocol}://#{host}:#{port}" : "#{protocol}://#{host}"
  end
end
