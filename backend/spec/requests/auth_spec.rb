# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Authentication", type: :request do
  describe "POST /users (registration)" do
    it "returns 201 and Authorization header on successful registration" do
      post user_registration_path,
        params: { user: { email: "new@example.com", password: "password123", password_confirmation: "password123" } },
        as: :json
      expect(response).to have_http_status(:created)
      expect(response.headers["Authorization"]).to start_with("Bearer ")
    end

    it "returns 422 with invalid params" do
      post user_registration_path,
        params: { user: { email: "bad", password: "password123", password_confirmation: "password123" } },
        as: :json
      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.headers["Authorization"]).to be_nil
    end
  end

  describe "POST /users/sign_in" do
    let(:user) { create(:user, password: "password123", password_confirmation: "password123") }

    it "returns 200 and Authorization header with valid credentials" do
      post user_session_path, params: { user: { email: user.email, password: "password123" } }, as: :json
      expect(response).to have_http_status(:ok)
      expect(response.headers["Authorization"]).to start_with("Bearer ")
    end

    it "returns 401 with invalid password" do
      post user_session_path, params: { user: { email: user.email, password: "wrong" } }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 401 with unknown email" do
      post user_session_path, params: { user: { email: "unknown@example.com", password: "password123" } }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/groups (protected)" do
    it "returns 401 without token" do
      get api_v1_groups_path, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 200 with valid token" do
      user = create(:user)
      token = request_jwt(user)
      get api_v1_groups_path, headers: { "Authorization" => "Bearer #{token}" }, as: :json
      expect(response).to have_http_status(:ok)
    end
  end
end
