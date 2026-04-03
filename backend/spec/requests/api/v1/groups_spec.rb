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

    it "allows regular user to create a group (auto-assigned as admin)" do
      post api_v1_groups_path,
        params: { group: { name: "My House", group_type: "household" } },
        headers: auth_headers(regular_user),
        as: :json
      expect(response).to have_http_status(:created)
      group = Group.find(response.parsed_body["data"]["id"])
      expect(group.memberships.find_by(user: regular_user).role).to eq("admin")
    end

    it "returns 403 when regular user has reached the 3-group limit" do
      create_list(:group, 3, created_by: regular_user).each do |g|
        create(:membership, :admin, group: g, user: regular_user)
      end
      post api_v1_groups_path,
        params: { group: { name: "One Too Many", group_type: "household" } },
        headers: auth_headers(regular_user),
        as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "returns 422 with invalid params" do
      post api_v1_groups_path,
        params: { group: { name: "", group_type: "household" } },
        headers: auth_headers(super_admin),
        as: :json
      expect(response).to have_http_status(:unprocessable_content)
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

    it "allows group admin to update" do
      group = create(:group, created_by: super_admin)
      admin_user = create(:user)
      create(:membership, :admin, group: group, user: admin_user)
      patch api_v1_group_path(group),
        params: { group: { name: "Updated by Admin" } },
        headers: auth_headers(admin_user),
        as: :json
      expect(response).to have_http_status(:ok)
      expect(group.reload.name).to eq("Updated by Admin")
    end

    it "returns 403 for group member" do
      group = create(:group, created_by: super_admin)
      create(:membership, group: group, user: regular_user)
      patch api_v1_group_path(group),
        params: { group: { name: "Updated" } },
        headers: auth_headers(regular_user),
        as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/v1/groups/:id/archive" do
    it "allows super_admin to archive their group" do
      group = create(:group, created_by: super_admin)
      post archive_api_v1_group_path(group), headers: auth_headers(super_admin), as: :json
      expect(response).to have_http_status(:ok)
      expect(group.reload.archived_at).to be_present
    end

    it "allows group admin to archive" do
      group = create(:group, created_by: super_admin)
      admin_user = create(:user)
      create(:membership, :admin, group: group, user: admin_user)
      post archive_api_v1_group_path(group), headers: auth_headers(admin_user), as: :json
      expect(response).to have_http_status(:ok)
      expect(group.reload.archived_at).to be_present
    end

    it "returns 403 for group member" do
      group = create(:group, created_by: super_admin)
      create(:membership, group: group, user: regular_user)
      post archive_api_v1_group_path(group), headers: auth_headers(regular_user), as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/v1/groups/:id/unarchive" do
    it "allows super_admin to unarchive their group" do
      group = create(:group, created_by: super_admin, archived_at: 1.day.ago)
      post unarchive_api_v1_group_path(group), headers: auth_headers(super_admin), as: :json
      expect(response).to have_http_status(:ok)
      expect(group.reload.archived_at).to be_nil
    end

    it "allows group admin to unarchive" do
      group = create(:group, created_by: super_admin, archived_at: 1.day.ago)
      admin_user = create(:user)
      create(:membership, :admin, group: group, user: admin_user)
      post unarchive_api_v1_group_path(group), headers: auth_headers(admin_user), as: :json
      expect(response).to have_http_status(:ok)
      expect(group.reload.archived_at).to be_nil
    end

    it "returns 403 for regular member" do
      group = create(:group, created_by: super_admin, archived_at: 1.day.ago)
      member = create(:user)
      create(:membership, group: group, user: member)
      post unarchive_api_v1_group_path(group), headers: auth_headers(member), as: :json
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

    it "returns 403 for group admin" do
      group = create(:group, created_by: super_admin)
      admin_user = create(:user)
      create(:membership, :admin, group: group, user: admin_user)
      delete api_v1_group_path(group), headers: auth_headers(admin_user), as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "returns 403 for regular users" do
      group = create(:group, created_by: super_admin)
      delete api_v1_group_path(group), headers: auth_headers(regular_user), as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end
end
