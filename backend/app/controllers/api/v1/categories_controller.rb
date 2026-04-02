# frozen_string_literal: true

module Api
  module V1
    class CategoriesController < BaseController
      before_action :set_category, only: [:show, :update, :destroy]

      def index
        categories = policy_scope(Category).order(:name)
        render json: { data: categories.as_json(only: %i[id name]) }
      end

      def show
        render json: { data: @category.as_json(only: %i[id name]) }
      end

      def create
        category = Category.new(category_params)
        authorize category
        if category.save
          render json: { data: category.as_json(only: %i[id name]) }, status: :created
        else
          render json: { errors: category.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        if @category.update(category_params)
          render json: { data: @category.as_json(only: %i[id name]) }
        else
          render json: { errors: @category.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        if @category.providers.any?
          render json: { errors: [I18n.t("errors.categories.has_providers")] }, status: :unprocessable_content
        else
          @category.destroy!
          head :no_content
        end
      end

      private

      def set_category
        @category = Category.find(params[:id])
        authorize @category
      end

      def category_params
        params.require(:category).permit(:name)
      end
    end
  end
end
