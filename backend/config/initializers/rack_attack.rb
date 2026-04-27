# frozen_string_literal: true

Rack::Attack.cache.store = Rails.env.test? ? ActiveSupport::Cache::MemoryStore.new : Rails.cache

class Rack::Attack
  PASSWORD_RESET_LIMIT   = ENV.fetch("PASSWORD_RESET_MAX_REQUESTS", 5).to_i
  PASSWORD_RESET_PERIOD  = ENV.fetch("PASSWORD_RESET_PERIOD_SECONDS", 1200).to_i

  # Limit password reset requests by IP
  throttle("password_reset/ip", limit: PASSWORD_RESET_LIMIT, period: PASSWORD_RESET_PERIOD) do |req|
    if req.post? && req.path == "/users/password"
      req.ip
    end
  end

  # Limit password reset requests by email (separate bucket per address)
  throttle("password_reset/email", limit: PASSWORD_RESET_LIMIT, period: PASSWORD_RESET_PERIOD) do |req|
    if req.post? && req.path == "/users/password"
      body = req.body.read
      req.body.rewind
      email = begin
        params = JSON.parse(body)
        params.dig("user", "email").to_s.downcase.presence
      rescue JSON::ParserError
        nil
      end
      email
    end
  end

  self.throttled_responder = lambda do |_req|
    [
      429,
      { "Content-Type" => "application/json" },
      [ { error: "Too many password reset requests. Please try again later." }.to_json ]
    ]
  end
end
