# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Providers", type: :request do
  describe "GET /api/v1/providers" do
    it "returns active providers" do
      p1 = create(:provider, name: "Plumber A")
      create(:provider, :archived)
      get api_v1_providers_path, headers: auth_headers, as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json["data"].size).to eq(1)
      expect(json["data"].first["name"]).to eq("Plumber A")
    end

    it "filters by category" do
      create(:provider, category: "plumber")
      create(:provider, :mechanic)
      get api_v1_providers_path, params: { category: "mechanic" }, headers: auth_headers, as: :json
      expect(response.parsed_body["data"].size).to eq(1)
      expect(response.parsed_body["data"].first["category"]).to eq("mechanic")
    end

    it "can return archived with archived=true" do
      create(:provider, :archived, name: "Old")
      get api_v1_providers_path, params: { archived: "true" }, headers: auth_headers, as: :json
      expect(response.parsed_body["data"].size).to eq(1)
      expect(response.parsed_body["data"].first["name"]).to eq("Old")
    end
  end

  describe "GET /api/v1/providers/:id" do
    it "returns the provider" do
      provider = create(:provider, name: "Test")
      get api_v1_provider_path(provider), headers: auth_headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"]["name"]).to eq("Test")
    end

    it "returns 404 for missing" do
      get api_v1_provider_path(id: 99999), headers: auth_headers, as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/providers" do
    it "creates a provider" do
      post api_v1_providers_path,
        params: { provider: { name: "New", category: "plumber" } },
        headers: auth_headers,
        as: :json
      expect(response).to have_http_status(:created)
      expect(response.parsed_body["data"]["name"]).to eq("New")
      expect(Provider.count).to eq(1)
    end

    it "returns 422 with invalid params" do
      post api_v1_providers_path,
        params: { provider: { name: "", category: "plumber" } },
        headers: auth_headers,
        as: :json
      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["errors"]).to be_present
    end
  end

  describe "PATCH /api/v1/providers/:id" do
    it "updates the provider" do
      provider = create(:provider, name: "Old")
      patch api_v1_provider_path(provider),
        params: { provider: { name: "Updated" } },
        headers: auth_headers,
        as: :json
      expect(response).to have_http_status(:ok)
      expect(provider.reload.name).to eq("Updated")
    end
  end

  describe "POST /api/v1/providers/:id/archive" do
    it "archives the provider" do
      provider = create(:provider)
      post archive_api_v1_provider_path(provider), headers: auth_headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(provider.reload.archived_at).to be_present
    end
  end

  describe "POST /api/v1/providers/:id/unarchive" do
    it "unarchives the provider" do
      provider = create(:provider, :archived)
      post unarchive_api_v1_provider_path(provider), headers: auth_headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(provider.reload.archived_at).to be_nil
    end
  end

  describe "DELETE /api/v1/providers/:id" do
    it "destroys the provider" do
      provider = create(:provider)
      delete api_v1_provider_path(provider), headers: auth_headers, as: :json
      expect(response).to have_http_status(:no_content)
      expect(Provider.exists?(provider.id)).to be false
    end
  end
end
