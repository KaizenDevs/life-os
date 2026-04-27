class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("SMTP_FROM", "noreply@kaizendevs.com")
  layout "mailer"

  def self.deliver_with_failover(message)
    MailerFailover.deliver(message)
  end
end
