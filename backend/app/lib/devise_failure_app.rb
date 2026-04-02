# frozen_string_literal: true

class DeviseFailureApp < Devise::FailureApp
  def respond
    self.status = 401
    self.content_type = "application/json"
    self.response_body = { error: I18n.t("errors.authentication.invalid_token") }.to_json
  end
end
