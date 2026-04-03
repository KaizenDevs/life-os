# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::GroupModules", type: :request do
  let(:owner)   { create(:user) }
  let(:member)  { create(:user) }
  let(:other)   { create(:user) }
  let(:group)   { create(:group, created_by: owner) }
  # Creating the module auto-provisions a group_module for existing groups via callback
  let(:mod)     { create(:life_os_module) }
  let!(:gm)     { group; mod; GroupModule.find_by!(group: group, life_os_module: mod) }

  before do
    create(:membership, group: group, user: owner,  role: :admin,  accepted_at: Time.current)
    create(:membership, group: group, user: member, role: :member, accepted_at: Time.current)
  end

  describe "GET /api/v1/groups/:group_id/group_modules" do
    it "returns group modules to a member" do
      get api_v1_group_group_modules_path(group), headers: auth_headers(member), as: :json
      expect(response).to have_http_status(:ok)
      data = response.parsed_body["data"]
      expect(data.size).to eq(1)
      expect(data.first["id"]).to eq(gm.id)
      expect(data.first["module"]["enabled"]).to eq(true)
    end

    it "returns 401 without token" do
      get api_v1_group_group_modules_path(group), as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "PATCH /api/v1/groups/:group_id/group_modules/:id" do
    it "allows group admin to disable a module" do
      patch api_v1_group_group_module_path(group, gm), params: { enabled: false }, headers: auth_headers(owner), as: :json
      expect(response).to have_http_status(:ok)
      expect(gm.reload.enabled).to eq(false)
    end

    it "forbids a regular member from toggling a module" do
      patch api_v1_group_group_module_path(group, gm), params: { enabled: false }, headers: auth_headers(member), as: :json
      expect(response).to have_http_status(:forbidden)
      expect(gm.reload.enabled).to eq(true)
    end

    it "returns 404 for a user outside the group" do
      patch api_v1_group_group_module_path(group, gm), params: { enabled: false }, headers: auth_headers(other), as: :json
      expect(response).to have_http_status(:not_found)
    end
  end
end
