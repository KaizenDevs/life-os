# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Memberships", type: :request do
  let(:super_admin) { create(:user, :super_admin) }
  let(:regular_user) { create(:user) }
  let(:group) { create(:group, created_by: super_admin) }

  describe "GET /api/v1/groups/:group_id/memberships" do
    it "allows super_admin to list memberships" do
      create(:membership, group: group, user: regular_user)
      get api_v1_group_memberships_path(group), headers: auth_headers(super_admin), as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"].size).to eq(1)
    end

    it "allows group member to list memberships" do
      create(:membership, group: group, user: regular_user)
      get api_v1_group_memberships_path(group), headers: auth_headers(regular_user), as: :json
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /api/v1/groups/:group_id/memberships" do
    it "allows super_admin to invite a user to their group" do
      invitee = create(:user)
      post api_v1_group_memberships_path(group),
        params: { membership: { user_id: invitee.id, role: "member" } },
        headers: auth_headers(super_admin),
        as: :json
      expect(response).to have_http_status(:created)
      expect(response.parsed_body["data"]["role"]).to eq("member")
      expect(response.parsed_body["data"]["accepted_at"]).to be_nil
    end

    it "allows group admin to invite to their group" do
      admin_user = create(:user)
      create(:membership, :admin, group: group, user: admin_user)
      invitee = create(:user)
      post api_v1_group_memberships_path(group),
        params: { membership: { user_id: invitee.id, role: "viewer" } },
        headers: auth_headers(admin_user),
        as: :json
      expect(response).to have_http_status(:created)
    end

    it "returns 403 for regular members" do
      create(:membership, group: group, user: regular_user)
      invitee = create(:user)
      post api_v1_group_memberships_path(group),
        params: { membership: { user_id: invitee.id, role: "member" } },
        headers: auth_headers(regular_user),
        as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "allows super_admin to invite to any group" do
      other_admin = create(:user, :super_admin)
      other_group = create(:group, created_by: other_admin)
      invitee = create(:user)
      post api_v1_group_memberships_path(other_group),
        params: { membership: { user_id: invitee.id, role: "member" } },
        headers: auth_headers(super_admin),
        as: :json
      expect(response).to have_http_status(:created)
    end
  end

  describe "PATCH /api/v1/groups/:group_id/memberships/:id" do
    it "allows super_admin to change role" do
      membership = create(:membership, group: group, user: regular_user, role: :member)
      patch api_v1_group_membership_path(group, membership),
        params: { membership: { role: "admin" } },
        headers: auth_headers(super_admin),
        as: :json
      expect(response).to have_http_status(:ok)
      expect(membership.reload.role).to eq("admin")
    end

    it "returns 403 for regular members" do
      membership = create(:membership, group: group, user: regular_user)
      other = create(:user)
      other_membership = create(:membership, group: group, user: other)
      patch api_v1_group_membership_path(group, other_membership),
        params: { membership: { role: "admin" } },
        headers: auth_headers(regular_user),
        as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/v1/groups/:group_id/memberships/:id/accept" do
    it "allows the invited user to accept" do
      membership = create(:membership, group: group, user: regular_user)
      post accept_api_v1_group_membership_path(group, membership),
        headers: auth_headers(regular_user),
        as: :json
      expect(response).to have_http_status(:ok)
      expect(membership.reload.accepted_at).to be_present
    end

    it "returns 404 when another user tries to accept (group not visible to them)" do
      membership = create(:membership, group: group, user: regular_user)
      other = create(:user)
      post accept_api_v1_group_membership_path(group, membership),
        headers: auth_headers(other),
        as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /api/v1/groups/:group_id/memberships/:id" do
    it "allows super_admin to remove a member" do
      membership = create(:membership, group: group, user: regular_user)
      delete api_v1_group_membership_path(group, membership),
        headers: auth_headers(super_admin),
        as: :json
      expect(response).to have_http_status(:no_content)
      expect(Membership.exists?(membership.id)).to be false
    end

    it "returns 403 for regular members" do
      membership = create(:membership, group: group, user: regular_user)
      other = create(:user)
      other_membership = create(:membership, group: group, user: other)
      delete api_v1_group_membership_path(group, other_membership),
        headers: auth_headers(regular_user),
        as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end
end
