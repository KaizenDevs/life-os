# frozen_string_literal: true

require "rails_helper"

RSpec.describe "GET /api/v1/services", type: :request do
  describe "authorization" do
    it "returns 401 without token" do
      get "/api/v1/services"
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 403 for regular user" do
      get "/api/v1/services", headers: auth_headers
      expect(response).to have_http_status(:forbidden)
    end

    it "returns 200 for super_admin" do
      get "/api/v1/services", headers: super_admin_headers
      expect(response).to have_http_status(:ok)
    end
  end

  describe "response shape" do
    it "returns email provider list" do
      get "/api/v1/services", headers: super_admin_headers
      body = response.parsed_body
      expect(body["email"]).to be_an(Array)
      expect(body["email"].first.keys).to include("name", "provider", "priority", "configured", "dashboard_url")
    end

    it "does not expose credentials" do
      get "/api/v1/services", headers: super_admin_headers
      raw = response.body
      expect(raw).not_to include("USERNAME")
      expect(raw).not_to include("PASSWORD")
    end
  end
end
