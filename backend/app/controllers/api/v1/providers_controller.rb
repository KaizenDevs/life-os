# frozen_string_literal: true

module Api
  module V1
    class ProvidersController < BaseController
      before_action :set_group
      before_action :set_provider, only: [:show, :update, :destroy, :archive, :unarchive]
      before_action -> { require_module!("contacts_book", @group) }

      def index
        providers = policy_scope(Provider)
                      .where(group: @group)
                      .search(params[:q])
                      .then { |s| params[:archived] == "true" ? s.archived : s.active }
                      .then { |s| params[:category].present? ? s.joins(:category).where(categories: { name: params[:category] }) : s }
                      .order(:name)

        render json: { data: providers.as_json(provider_json_options) }
      end

      def show
        render json: { data: @provider.as_json(provider_json_options) }
      end

      def create
        provider = @group.providers.new(provider_params)
        authorize provider
        if provider.save
          render json: { data: provider.as_json(provider_json_options) }, status: :created
        else
          render json: { errors: provider.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @provider.update(provider_params)
          render json: { data: @provider.as_json(provider_json_options) }
        else
          render json: { errors: @provider.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @provider.destroy!
        head :no_content
      end

      def archive
        @provider.archive!
        render json: { data: @provider.as_json(provider_json_options) }
      end

      def unarchive
        @provider.unarchive!
        render json: { data: @provider.as_json(provider_json_options) }
      end

      private

      def set_group
        @group = policy_scope(Group).find(params[:group_id])
      end

      def set_provider
        @provider = @group.providers.find(params[:id])
        authorize @provider
      end

      def provider_params
        params.require(:provider).permit(:name, :category_id, :phone, :email, :address, :notes)
      end

      def provider_json_options
        { only: %i[id name phone email address notes archived_at created_at updated_at],
          include: { category: { only: %i[id name] } } }
      end
    end
  end
end
