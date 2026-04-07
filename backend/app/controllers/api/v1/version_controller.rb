module Api
  module V1
    class VersionController < ApplicationController
      skip_before_action :authenticate_user!

      def show
        render json: {
          version: ENV.fetch("APP_VERSION", "dev"),
          env: ENV.fetch("APP_ENV", "development")
        }
      end
    end
  end
end
