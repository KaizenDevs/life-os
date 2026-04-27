# frozen_string_literal: true

module Api
  module V1
    class ServicesController < BaseController
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
    end
  end
end
