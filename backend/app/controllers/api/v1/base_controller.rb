# frozen_string_literal: true

module Api
  module V1
    class BaseController < ApplicationController
      include Pundit::Authorization

      before_action :authenticate_user!

      rescue_from Pundit::NotAuthorizedError, with: :forbidden

      private

      def forbidden
        render json: { error: "Not authorized" }, status: :forbidden
      end
    end
  end
end
