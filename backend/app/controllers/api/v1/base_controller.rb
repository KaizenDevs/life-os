# frozen_string_literal: true

module Api
  module V1
    class BaseController < ApplicationController
      include Pundit::Authorization

      before_action :authenticate_user!

      rescue_from Pundit::NotAuthorizedError, with: :forbidden
      rescue_from JWT::DecodeError, with: :unauthorized

      private

      def forbidden
        render json: { error: I18n.t("errors.authentication.unauthorized") }, status: :forbidden
      end

      def unauthorized
        render json: { error: I18n.t("errors.authentication.invalid_token") }, status: :unauthorized
      end
    end
  end
end
