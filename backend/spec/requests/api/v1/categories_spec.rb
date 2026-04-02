# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Categories", type: :request do
  let(:super_admin)  { create(:user, :super_admin) }
  let(:regular_user) { create(:user) }
  let(:category)     { create(:category, name: "plumber") }

  describe "GET /api/v1/categories" do
    before { category }

    it "returns all categories for any authenticated user" do
      get api_v1_categories_path, headers: auth_headers(regular_user), as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"].map { |c| c["name"] }).to include("plumber")
    end

    it "returns 401 without token" do
      get api_v1_categories_path, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/categories/:id" do
    it "returns the category for any authenticated user" do
      get api_v1_category_path(category), headers: auth_headers(regular_user), as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"]["name"]).to eq("plumber")
    end
  end

  describe "POST /api/v1/categories" do
    it "allows super_admin to create a category" do
      post api_v1_categories_path,
        params: { category: { name: "carpenter" } },
        headers: auth_headers(super_admin),
        as: :json
      expect(response).to have_http_status(:created)
      expect(response.parsed_body["data"]["name"]).to eq("carpenter")
    end

    it "returns 403 for regular user" do
      post api_v1_categories_path,
        params: { category: { name: "carpenter" } },
        headers: auth_headers(regular_user),
        as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "returns 422 with duplicate name" do
      category
      post api_v1_categories_path,
        params: { category: { name: "plumber" } },
        headers: auth_headers(super_admin),
        as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "PATCH /api/v1/categories/:id" do
    it "allows super_admin to update a category" do
      patch api_v1_category_path(category),
        params: { category: { name: "plumbing" } },
        headers: auth_headers(super_admin),
        as: :json
      expect(response).to have_http_status(:ok)
      expect(category.reload.name).to eq("plumbing")
    end

    it "returns 403 for regular user" do
      patch api_v1_category_path(category),
        params: { category: { name: "plumbing" } },
        headers: auth_headers(regular_user),
        as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /api/v1/categories/:id" do
    it "allows super_admin to delete a category with no providers" do
      delete api_v1_category_path(category), headers: auth_headers(super_admin), as: :json
      expect(response).to have_http_status(:no_content)
      expect(Category.exists?(category.id)).to be false
    end

    it "returns 422 when category has providers" do
      group = create(:group, created_by: super_admin)
      create(:provider, group: group, category: category)
      delete api_v1_category_path(category), headers: auth_headers(super_admin), as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns 403 for regular user" do
      delete api_v1_category_path(category), headers: auth_headers(regular_user), as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end
end
