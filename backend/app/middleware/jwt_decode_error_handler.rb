# frozen_string_literal: true

class JwtDecodeErrorHandler
  def initialize(app)
    @app = app
  end

  def call(env)
    @app.call(env)
  rescue JWT::DecodeError
    [ 401, { "Content-Type" => "application/json" }, [ '{"error":"Invalid or missing token"}' ] ]
  end
end
