# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::LifeOsModules", type: :request do
  let(:super_admin) { create(:user, :super_admin) }
  let(:user)        { create(:user) }

  describe "GET /api/v1/life_os_modules" do
    let!(:enabled_mod)  { create(:life_os_module, enabled: true) }
    let!(:disabled_mod) { create(:life_os_module, enabled: false) }

    it "returns all modules to a super_admin" do
      get api_v1_life_os_modules_path, headers: auth_headers(super_admin), as: :json
      expect(response).to have_http_status(:ok)
      ids = response.parsed_body["data"].map { |m| m["id"] }
      expect(ids).to include(enabled_mod.id, disabled_mod.id)
    end

    it "returns only enabled modules to a regular user" do
      get api_v1_life_os_modules_path, headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:ok)
      ids = response.parsed_body["data"].map { |m| m["id"] }
      expect(ids).to include(enabled_mod.id)
      expect(ids).not_to include(disabled_mod.id)
    end

    it "returns 401 without token" do
      get api_v1_life_os_modules_path, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "PATCH /api/v1/life_os_modules/:id" do
    let!(:mod) { create(:life_os_module, enabled: true) }

    it "allows super_admin to disable a module" do
      patch api_v1_life_os_module_path(mod), params: { enabled: false }, headers: auth_headers(super_admin), as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"]["enabled"]).to eq(false)
      expect(mod.reload.enabled).to eq(false)
    end

    it "allows super_admin to enable a module" do
      mod.update!(enabled: false)
      patch api_v1_life_os_module_path(mod), params: { enabled: true }, headers: auth_headers(super_admin), as: :json
      expect(response).to have_http_status(:ok)
      expect(mod.reload.enabled).to eq(true)
    end

    it "forbids a regular user from updating a module" do
      patch api_v1_life_os_module_path(mod), params: { enabled: false }, headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:forbidden)
      expect(mod.reload.enabled).to eq(true)
    end
  end
end
