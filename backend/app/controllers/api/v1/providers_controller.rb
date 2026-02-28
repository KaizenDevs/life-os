# frozen_string_literal: true

module Api
  module V1
    class ProvidersController < BaseController
      before_action :set_provider, only: [:show, :update, :destroy, :archive, :unarchive]

      def index
        providers = Provider.search(params[:q])
                           .then { |s| params[:archived] == "true" ? s.archived : s.active }
                           .then { |s| params[:category].present? ? s.where(category: params[:category]) : s }
                           .order(:name)

        render json: { data: providers.as_json(provider_json_options) }
      end

      def show
        render json: { data: @provider.as_json(provider_json_options) }
      end

      def create
        provider = Provider.new(provider_params)
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

      def set_provider
        @provider = Provider.find(params[:id])
      end

      def provider_params
        params.require(:provider).permit(:name, :category, :phone, :email, :address, :notes)
      end

      def provider_json_options
        { only: %i[id name category phone email address notes archived_at created_at updated_at] }
      end
    end
  end
end
