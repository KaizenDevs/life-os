# frozen_string_literal: true

module Api
  module V1
    class GroupModulesController < BaseController
      before_action :set_group

      def index
        group_modules = @group.group_modules.includes(:life_os_module)
        render json: { data: group_modules.map { |gm| serialize(gm) } }
      end

      def update
        gm = @group.group_modules.find(params[:id])
        authorize gm
        gm.update!(enabled: params[:enabled])
        render json: { data: serialize(gm) }
      end

      private

      def set_group
        @group = policy_scope(Group).find(params[:group_id])
      end

      def serialize(gm)
        {
          id: gm.id,
          enabled: gm.enabled,
          module: gm.life_os_module.as_json(only: %i[id name key enabled])
        }
      end
    end
  end
end
