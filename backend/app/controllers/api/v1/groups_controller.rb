# frozen_string_literal: true

module Api
  module V1
    class GroupsController < BaseController
      before_action :set_group, only: [:show, :update, :destroy, :archive, :unarchive]

      def index
        groups = policy_scope(Group)
        render json: { data: groups.map { |g| serialize_group(g) } }
      end

      def show
        authorize @group
        render json: { data: @group.as_json(serialize_group(@group)) }
      end

      def create
        group = Group.new(group_params.merge(created_by: current_user))
        authorize group
        if group.save
          group.memberships.create!(user: current_user, role: :admin, accepted_at: Time.current)
          render json: { data: serialize_group(group) }, status: :created
        else
          render json: { errors: group.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        authorize @group
        if @group.update(group_params)
          render json: { data: @group.as_json(serialize_group(@group)) }
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
        render json: { data: @group.as_json(serialize_group(@group)) }
      end

      def unarchive
        authorize @group
        @group.unarchive!
        render json: { data: @group.as_json(serialize_group(@group)) }
      end

      private

      def set_group
        @group = Group.find(params[:id])
      end

      def group_params
        params.require(:group).permit(:name, :group_type)
      end

      def serialize_group(group)
        membership = group.memberships.find_by(user: current_user, accepted_at: ..Time.current)
        group.as_json(only: %i[id name group_type archived_at created_at updated_at],
                      include: { created_by: { only: %i[id email] } })
             .merge("my_role" => current_user.super_admin? ? "admin" : membership&.role)
      end
    end
  end
end
