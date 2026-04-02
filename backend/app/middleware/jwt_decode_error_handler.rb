# frozen_string_literal: true

class JwtDecodeErrorHandler
  def initialize(app)
    @app = app
  end

  def call(env)
    @app.call(env)
  rescue JWT::DecodeError
    [ 401, { "Content-Type" => "application/json" }, [ { error: I18n.t("errors.authentication.invalid_token") }.to_json ] ]
  end
end
