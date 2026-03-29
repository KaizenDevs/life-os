# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Groups", type: :request do
  let(:super_admin) { create(:user, :super_admin) }
  let(:regular_user) { create(:user) }

  describe "GET /api/v1/groups" do
    it "returns groups created by super_admin" do
      create(:group, created_by: super_admin)
      get api_v1_groups_path, headers: auth_headers(super_admin), as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"].size).to eq(1)
    end

    it "returns groups the user is a member of" do
      group = create(:group, created_by: super_admin)
      create(:membership, user: regular_user, group: group)
      get api_v1_groups_path, headers: auth_headers(regular_user), as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"].size).to eq(1)
    end

    it "does not return groups the user has no access to" do
      create(:group, created_by: super_admin)
      get api_v1_groups_path, headers: auth_headers(regular_user), as: :json
      expect(response.parsed_body["data"]).to be_empty
    end
  end

  describe "POST /api/v1/groups" do
    it "allows super_admin to create a group" do
      post api_v1_groups_path,
        params: { group: { name: "My House", group_type: "household" } },
        headers: auth_headers(super_admin),
        as: :json
      expect(response).to have_http_status(:created)
      expect(response.parsed_body["data"]["name"]).to eq("My House")
    end

    it "returns 403 for regular users" do
      post api_v1_groups_path,
        params: { group: { name: "My House", group_type: "household" } },
        headers: auth_headers(regular_user),
        as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "returns 422 with invalid params" do
      post api_v1_groups_path,
        params: { group: { name: "", group_type: "household" } },
        headers: auth_headers(super_admin),
        as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "PATCH /api/v1/groups/:id" do
    it "allows super_admin to update their group" do
      group = create(:group, created_by: super_admin)
      patch api_v1_group_path(group),
        params: { group: { name: "Updated" } },
        headers: auth_headers(super_admin),
        as: :json
      expect(response).to have_http_status(:ok)
      expect(group.reload.name).to eq("Updated")
    end

    it "returns 403 for regular users" do
      group = create(:group, created_by: super_admin)
      patch api_v1_group_path(group),
        params: { group: { name: "Updated" } },
        headers: auth_headers(regular_user),
        as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /api/v1/groups/:id" do
    it "allows super_admin to delete their group" do
      group = create(:group, created_by: super_admin)
      delete api_v1_group_path(group), headers: auth_headers(super_admin), as: :json
      expect(response).to have_http_status(:no_content)
      expect(Group.exists?(group.id)).to be false
    end

    it "returns 403 for regular users" do
      group = create(:group, created_by: super_admin)
      delete api_v1_group_path(group), headers: auth_headers(regular_user), as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end
end
