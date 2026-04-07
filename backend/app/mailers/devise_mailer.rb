class DeviseMailer < Devise::Mailer
  def reset_password_instructions(record, token, opts = {})
    @token = token
    @resource = record
    @reset_url = "#{root_url(host: default_url_options[:host], protocol: default_url_options[:protocol])}reset-password?reset_password_token=#{token}"
    mail(to: record.email, subject: "Reset your Life OS password")
  end
end
