# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Providers", type: :request do
  let(:super_admin)  { create(:user, :super_admin) }
  let(:group)        { create(:group, created_by: super_admin) }
  let(:admin_user)   { create(:user).tap { |u| create(:membership, :admin, group: group, user: u) } }
  let(:member_user)  { create(:user).tap { |u| create(:membership, group: group, user: u) } }
  let(:viewer_user)  { create(:user).tap { |u| create(:membership, :viewer, group: group, user: u) } }
  let(:outsider)     { create(:user) }

  let(:default_category) { create(:category, name: "plumber") }
  let(:provider) { create(:provider, group: group, category: default_category) }

  # Ensure contacts_book module is enabled for the group so require_module! passes
  before do
    mod = LifeOsModule.find_or_create_by!(key: "contacts_book") { |m| m.name = "Contacts Book"; m.enabled = true }
    group.group_modules.find_or_create_by!(life_os_module: mod) { |gm| gm.enabled = true }
  end

  describe "module disabled" do
    before do
      mod = LifeOsModule.find_by!(key: "contacts_book")
      mod.update!(enabled: false)
    end

    it "returns 403 when the global module is disabled" do
      get api_v1_group_providers_path(group), headers: auth_headers(admin_user), as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "group module disabled" do
    before do
      mod = LifeOsModule.find_by!(key: "contacts_book")
      group.group_modules.find_by!(life_os_module: mod).update!(enabled: false)
    end

    it "returns 403 when the group module is disabled" do
      get api_v1_group_providers_path(group), headers: auth_headers(admin_user), as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "GET /api/v1/groups/:group_id/providers" do
    before { create(:provider, group: group, name: "Active Provider", category: default_category) }

    it "returns active providers for admin" do
      get api_v1_group_providers_path(group), headers: auth_headers(admin_user), as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"].size).to eq(1)
    end

    it "returns active providers for member" do
      get api_v1_group_providers_path(group), headers: auth_headers(member_user), as: :json
      expect(response).to have_http_status(:ok)
    end

    it "returns active providers for viewer" do
      get api_v1_group_providers_path(group), headers: auth_headers(viewer_user), as: :json
      expect(response).to have_http_status(:ok)
    end

    it "returns 404 for outsider (cannot see the group)" do
      get api_v1_group_providers_path(group), headers: auth_headers(outsider), as: :json
      expect(response).to have_http_status(:not_found)
    end

    it "does not return providers from other groups" do
      other_admin = create(:user, :super_admin)
      other_group = create(:group, created_by: other_admin)
      create(:membership, group: other_group, user: member_user)
      create(:provider, group: other_group, name: "Other Group Provider")

      get api_v1_group_providers_path(group), headers: auth_headers(member_user), as: :json
      names = response.parsed_body["data"].map { |p| p["name"] }
      expect(names).not_to include("Other Group Provider")
    end

    it "filters by category" do
      create(:provider, :mechanic, group: group)
      get "#{api_v1_group_providers_path(group)}?category=mechanic", headers: auth_headers(member_user), as: :json
      expect(response.parsed_body["data"].all? { |p| p["category"]["name"] == "mechanic" }).to be true
    end

    it "returns archived providers with archived=true" do
      create(:provider, :archived, group: group, name: "Archived")
      get "#{api_v1_group_providers_path(group)}?archived=true", headers: auth_headers(member_user), as: :json
      expect(response.parsed_body["data"].map { |p| p["name"] }).to include("Archived")
    end
  end

  describe "GET /api/v1/groups/:group_id/providers/:id" do
    it "returns the provider for any group member" do
      [ admin_user, member_user, viewer_user ].each do |user|
        get api_v1_group_provider_path(group, provider), headers: auth_headers(user), as: :json
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["data"]["id"]).to eq(provider.id)
      end
    end

    it "returns 404 for outsider" do
      get api_v1_group_provider_path(group, provider), headers: auth_headers(outsider), as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/groups/:group_id/providers" do
    let(:valid_params) { { provider: { name: "New Provider", category_id: default_category.id } } }

    it "allows admin to create a provider" do
      post api_v1_group_providers_path(group), params: valid_params, headers: auth_headers(admin_user), as: :json
      expect(response).to have_http_status(:created)
      expect(response.parsed_body["data"]["name"]).to eq("New Provider")
    end

    it "allows member to create a provider" do
      post api_v1_group_providers_path(group), params: valid_params, headers: auth_headers(member_user), as: :json
      expect(response).to have_http_status(:created)
    end

    it "returns 403 for viewer" do
      post api_v1_group_providers_path(group), params: valid_params, headers: auth_headers(viewer_user), as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "returns 422 with invalid params" do
      post api_v1_group_providers_path(group),
        params: { provider: { name: "", category_id: default_category.id } },
        headers: auth_headers(member_user),
        as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "PATCH /api/v1/groups/:group_id/providers/:id" do
    it "allows admin to update" do
      patch api_v1_group_provider_path(group, provider),
        params: { provider: { name: "Updated" } },
        headers: auth_headers(admin_user),
        as: :json
      expect(response).to have_http_status(:ok)
      expect(provider.reload.name).to eq("Updated")
    end

    it "allows member to update" do
      patch api_v1_group_provider_path(group, provider),
        params: { provider: { name: "Updated" } },
        headers: auth_headers(member_user),
        as: :json
      expect(response).to have_http_status(:ok)
    end

    it "returns 403 for viewer" do
      patch api_v1_group_provider_path(group, provider),
        params: { provider: { name: "Updated" } },
        headers: auth_headers(viewer_user),
        as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/v1/groups/:group_id/providers/:id/archive" do
    it "allows admin to archive" do
      post archive_api_v1_group_provider_path(group, provider), headers: auth_headers(admin_user), as: :json
      expect(response).to have_http_status(:ok)
      expect(provider.reload.archived_at).to be_present
    end

    it "allows member to archive" do
      post archive_api_v1_group_provider_path(group, provider), headers: auth_headers(member_user), as: :json
      expect(response).to have_http_status(:ok)
    end

    it "returns 403 for viewer" do
      post archive_api_v1_group_provider_path(group, provider), headers: auth_headers(viewer_user), as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/v1/groups/:group_id/providers/:id/unarchive" do
    let(:provider) { create(:provider, :archived, group: group) }

    it "allows admin to unarchive" do
      post unarchive_api_v1_group_provider_path(group, provider), headers: auth_headers(admin_user), as: :json
      expect(response).to have_http_status(:ok)
      expect(provider.reload.archived_at).to be_nil
    end

    it "allows member to unarchive" do
      post unarchive_api_v1_group_provider_path(group, provider), headers: auth_headers(member_user), as: :json
      expect(response).to have_http_status(:ok)
    end

    it "returns 403 for viewer" do
      post unarchive_api_v1_group_provider_path(group, provider), headers: auth_headers(viewer_user), as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /api/v1/groups/:group_id/providers/:id" do
    it "allows admin to hard delete" do
      delete api_v1_group_provider_path(group, provider), headers: auth_headers(admin_user), as: :json
      expect(response).to have_http_status(:no_content)
      expect(Provider.exists?(provider.id)).to be false
    end

    it "returns 403 for member" do
      delete api_v1_group_provider_path(group, provider), headers: auth_headers(member_user), as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "returns 403 for viewer" do
      delete api_v1_group_provider_path(group, provider), headers: auth_headers(viewer_user), as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end
end
