# Mailer configuration driven entirely by ENV vars.
#
# Local Postfix (default — no SMTP_ADDRESS set):
#   Rails delivers via localhost:25, Postfix sends directly.
#
# External provider (set SMTP_ADDRESS + credentials):
#   Works with Resend, Sendgrid, Postmark, Mailgun, etc.
#   Just update SMTP_ADDRESS, SMTP_USERNAME, SMTP_PASSWORD in .env.

if ENV["SMTP_ADDRESS"].present?
  Rails.application.config.action_mailer.delivery_method = :smtp
  Rails.application.config.action_mailer.smtp_settings = {
    address:              ENV["SMTP_ADDRESS"],
    port:                 ENV.fetch("SMTP_PORT", 587).to_i,
    user_name:            ENV["SMTP_USERNAME"],
    password:             ENV["SMTP_PASSWORD"],
    authentication:       :plain,
    enable_starttls_auto: true
  }
else
  # Use local Postfix — no credentials needed
  Rails.application.config.action_mailer.delivery_method = :smtp
  Rails.application.config.action_mailer.smtp_settings = {
    address: "localhost",
    port:    25
  }
end

Rails.application.config.action_mailer.default_options = {
  from: ENV.fetch("SMTP_FROM", "noreply@#{ENV.fetch('SMTP_DOMAIN', 'localhost')}")
}
