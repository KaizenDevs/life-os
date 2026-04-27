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
    last_error = nil
    delivered = false

    ExternalServices.smtp_providers_in_order.each do |key, name|
      smtp_settings = ExternalServices.smtp_settings_for(key)
      next unless smtp_settings

      begin
        Mail::SMTP.new(smtp_settings).deliver!(mail)
        Rails.logger.info("[MailerFailover] Delivered via #{name}")
        delivered = true
        return
      rescue *SMTP_ERRORS => e
        Rails.logger.error("[MailerFailover] #{name} failed: #{e.class} — #{e.message}")
        last_error = e
      end
    end

    unless delivered
      Rails.logger.warn("[MailerFailover] No SMTP providers configured — skipping delivery") unless last_error
      raise last_error || Net::SMTPFatalError.new("All SMTP providers exhausted")
    end
  end
end
