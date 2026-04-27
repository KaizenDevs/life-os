# frozen_string_literal: true

require "net/smtp"

# Attempts delivery via each configured SMTP provider in priority order.
# Falls through to the next provider on any SMTP/network error.
module MailerFailover
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

  def self.deliver(message)
    providers = ExternalServices.active_smtp_providers.select { |p| p[:configured] }

    if providers.empty?
      Rails.logger.warn("[MailerFailover] No SMTP providers configured — skipping delivery")
      return false
    end

    providers.each do |provider|
      settings = ExternalServices.smtp_settings_for(provider[:key])
      next unless settings

      begin
        message.delivery_method(:smtp, settings)
        message.deliver!
        Rails.logger.info("[MailerFailover] Delivered via #{provider[:name]}")
        return true
      rescue *SMTP_ERRORS => e
        Rails.logger.error("[MailerFailover] #{provider[:name]} failed: #{e.class} — #{e.message}")
        next
      end
    end

    Rails.logger.error("[MailerFailover] All SMTP providers failed for message to #{message.to}")
    raise Net::SMTPFatalError, "All SMTP providers exhausted"
  end
end
