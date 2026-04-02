# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Users", type: :request do
  let(:user) { create(:user) }

  describe "GET /api/v1/users" do
    before { create(:user, email: "alice@example.com") }

    it "returns users matching the email search" do
      get api_v1_users_path, params: { email: "alice" }, headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"].map { |u| u["email"] }).to include("alice@example.com")
    end

    it "does not return users that don't match" do
      get api_v1_users_path, params: { email: "zzz" }, headers: auth_headers(user), as: :json
      expect(response.parsed_body["data"]).to be_empty
    end

    it "returns up to 10 results with no filter" do
      get api_v1_users_path, headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"].size).to be <= 10
    end

    it "returns 401 without token" do
      get api_v1_users_path, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
