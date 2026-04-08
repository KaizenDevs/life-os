module Api
  module V1
    class VersionController < ApplicationController
      skip_before_action :authenticate_user!, raise: false

      def show
        render json: {
          version: File.read(Rails.root.join("VERSION")).strip
        }
      end
    end
  end
end
