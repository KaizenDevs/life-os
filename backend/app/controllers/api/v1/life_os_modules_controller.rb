# frozen_string_literal: true

module Api
  module V1
    class LifeOsModulesController < BaseController
      def index
        modules = policy_scope(LifeOsModule).order(:name)
        render json: { data: modules.as_json(only: %i[id name key enabled]) }
      end

      def update
        mod = LifeOsModule.find(params[:id])
        authorize mod
        mod.update!(enabled: params[:enabled])
        render json: { data: mod.as_json(only: %i[id name key enabled]) }
      end
    end
  end
end
