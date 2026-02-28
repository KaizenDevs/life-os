# frozen_string_literal: true

module RequestHelpers
  def auth_headers(user = nil)
    user ||= create(:user)
    token = request_jwt(user)
    { "Authorization" => "Bearer #{token}" }
  end

  def request_jwt(user)
    post user_session_path, params: { user: { email: user.email, password: user.password || "password123" } }, as: :json
    return nil unless response.successful?
    response.headers["Authorization"]&.split(" ")&.last
  end
end

RSpec.configure do |config|
  config.include RequestHelpers, type: :request
end
