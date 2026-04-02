# frozen_string_literal: true

module Api
  module V1
    class UsersController < BaseController
      def index
        authorize User
        users = policy_scope(User)
        users = users.where("email ILIKE ?", "%#{params[:email]}%") if params[:email].present?
        render json: { data: users.limit(10).map { |u| { id: u.id, email: u.email } } }
      end
    end
  end
end
