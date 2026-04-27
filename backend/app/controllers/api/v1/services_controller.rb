# frozen_string_literal: true

module Api
  module V1
    class ServicesController < BaseController
      before_action :require_super_admin!

      def index
        render json: {
          email: ExternalServices.active_smtp_providers.map do |p|
            {
              name: p[:name],
              provider: p[:provider],
              priority: p[:priority],
              configured: p[:configured],
              dashboard_url: p[:dashboard_url]
            }
          end
        }
      end

      private

      def require_super_admin!
        return if current_user&.super_admin?
        render json: { error: I18n.t("errors.authentication.unauthorized") }, status: :forbidden
      end
    end
  end
end
