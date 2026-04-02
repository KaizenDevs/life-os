# frozen_string_literal: true

module Api
  module V1
    class GroupsController < BaseController
      before_action :set_group, only: [:show, :update, :destroy, :archive, :unarchive]

      def index
        groups = policy_scope(Group)
        render json: { data: groups.as_json(group_json_options) }
      end

      def show
        authorize @group
        render json: { data: @group.as_json(group_json_options) }
      end

      def create
        group = Group.new(group_params.merge(created_by: current_user))
        authorize group
        if group.save
          render json: { data: group.as_json(group_json_options) }, status: :created
        else
          render json: { errors: group.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        authorize @group
        if @group.update(group_params)
          render json: { data: @group.as_json(group_json_options) }
        else
          render json: { errors: @group.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        authorize @group
        @group.destroy!
        head :no_content
      end

      def archive
        authorize @group
        @group.archive!
        render json: { data: @group.as_json(group_json_options) }
      end

      def unarchive
        authorize @group
        @group.unarchive!
        render json: { data: @group.as_json(group_json_options) }
      end

      private

      def set_group
        @group = Group.find(params[:id])
      end

      def group_params
        params.require(:group).permit(:name, :group_type)
      end

      def group_json_options
        {
          only: %i[id name group_type archived_at created_at updated_at],
          include: { created_by: { only: %i[id email] } }
        }
      end
    end
  end
end
