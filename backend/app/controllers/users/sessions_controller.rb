# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    render json: { data: { id: resource.id, email: resource.email } }, status: :ok
  end

  def respond_to_on_destroy
    render json: { message: "Signed out successfully" }, status: :ok
  end
end
