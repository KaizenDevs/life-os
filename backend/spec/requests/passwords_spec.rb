# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Password Reset", type: :request do
  describe "POST /users/password (forgot password)" do
    it "returns 200 when email exists" do
      create(:user, email: "user@example.com")
      post user_password_path, params: { user: { email: "user@example.com" } }, as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["message"]).to be_present
    end

    it "returns 200 even when email does not exist (no enumeration)" do
      post user_password_path, params: { user: { email: "nobody@example.com" } }, as: :json
      expect(response).to have_http_status(:ok)
    end

    it "sends a reset email when user exists" do
      create(:user, email: "user@example.com")
      expect {
        post user_password_path, params: { user: { email: "user@example.com" } }, as: :json
      }.to change(ActionMailer::Base.deliveries, :count).by(1)
    end

    it "does not send an email when user does not exist" do
      expect {
        post user_password_path, params: { user: { email: "nobody@example.com" } }, as: :json
      }.not_to change(ActionMailer::Base.deliveries, :count)
    end
  end

  describe "PUT /users/password (reset password)" do
    let(:user) { create(:user) }
    let(:token) { user.send_reset_password_instructions }

    it "returns 200 and updates the password with valid token" do
      put user_password_path,
        params: { user: { reset_password_token: token, password: "newpassword1", password_confirmation: "newpassword1" } },
        as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["message"]).to be_present
    end

    it "returns 422 with invalid token" do
      put user_password_path,
        params: { user: { reset_password_token: "invalid", password: "newpassword1", password_confirmation: "newpassword1" } },
        as: :json
      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["errors"]).to be_present
    end

    it "returns 422 when passwords do not match" do
      put user_password_path,
        params: { user: { reset_password_token: token, password: "newpassword1", password_confirmation: "different" } },
        as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "allows login with new password after reset" do
      put user_password_path,
        params: { user: { reset_password_token: token, password: "newpassword1", password_confirmation: "newpassword1" } },
        as: :json
      post user_session_path, params: { user: { email: user.email, password: "newpassword1" } }, as: :json
      expect(response).to have_http_status(:ok)
      expect(response.headers["Authorization"]).to start_with("Bearer ")
    end

    it "rejects the same token used twice" do
      put user_password_path,
        params: { user: { reset_password_token: token, password: "newpassword1", password_confirmation: "newpassword1" } },
        as: :json
      put user_password_path,
        params: { user: { reset_password_token: token, password: "anotherpass1", password_confirmation: "anotherpass1" } },
        as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
