# frozen_string_literal: true

require "net/smtp"

# Custom ActionMailer delivery method with automatic provider failover.
# Registered as :mailer_failover — set config.action_mailer.delivery_method = :mailer_failover.
# Tries providers in priority order, falls through on any SMTP/network error.
class MailerFailover
  SMTP_ERRORS = [
    Net::SMTPAuthenticationError,
    Net::SMTPServerBusy,
    Net::SMTPSyntaxError,
    Net::SMTPFatalError,
    Net::SMTPUnknownError,
    Errno::ECONNREFUSED,
    Errno::ETIMEDOUT,
    SocketError,
    Timeout::Error
  ].freeze

  def initialize(settings = {})
    @settings = settings
  end

  def deliver!(mail)
    providers = ExternalServices.active_smtp_providers
                                .select { |p| p[:configured] }

    if providers.empty?
      Rails.logger.warn("[MailerFailover] No SMTP providers configured — skipping delivery")
      return
    end

    last_error = nil

    providers.each do |provider|
      smtp_settings = ExternalServices.smtp_settings_for(provider[:key])
      next unless smtp_settings

      begin
        mail.delivery_method(:smtp, smtp_settings)
        mail.deliver!
        Rails.logger.info("[MailerFailover] Delivered via #{provider[:name]}")
        return
      rescue *SMTP_ERRORS => e
        Rails.logger.error("[MailerFailover] #{provider[:name]} failed: #{e.class} — #{e.message}")
        last_error = e
      end
    end

    raise last_error || Net::SMTPFatalError.new("All SMTP providers exhausted")
  end
end
