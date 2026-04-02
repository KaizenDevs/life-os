# frozen_string_literal: true

module Api
  module V1
    class MembershipsController < BaseController
      before_action :set_group
      before_action :set_membership, only: [:update, :destroy, :accept]

      def index
        memberships = policy_scope(Membership).where(group: @group)
        render json: { data: memberships.as_json(membership_json_options) }
      end

      def create
        membership = @group.memberships.new(membership_params.merge(invited_by: current_user))
        authorize membership
        if membership.save
          render json: { data: membership.as_json(membership_json_options) }, status: :created
        else
          render json: { errors: membership.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        authorize @membership
        if @membership.update(update_membership_params)
          render json: { data: @membership.as_json(membership_json_options) }
        else
          render json: { errors: @membership.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        authorize @membership
        @membership.destroy!
        head :no_content
      end

      def accept
        authorize @membership
        @membership.accept!
        render json: { data: @membership.as_json(membership_json_options) }
      end

      private

      def set_group
        @group = policy_scope(Group).find(params[:group_id])
      end

      def set_membership
        @membership = @group.memberships.find(params[:id])
      end

      def membership_params
        params.require(:membership).permit(:user_id, :role)
      end

      def update_membership_params
        params.require(:membership).permit(:role)
      end

      def membership_json_options
        {
          only: %i[id role accepted_at created_at updated_at],
          include: {
            user: { only: %i[id email] },
            invited_by: { only: %i[id email] }
          }
        }
      end
    end
  end
end
