class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("SMTP_FROM", "noreply@kaizendevs.com")
  layout "mailer"
end
