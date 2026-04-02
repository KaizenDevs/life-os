# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  def create
    build_resource(sign_up_params)

    resource.save
    if resource.persisted?
      token, _payload = Warden::JWTAuth::UserEncoder.new.call(resource, :user, nil)
      response.set_header("Authorization", "Bearer #{token}")
      render json: { data: { id: resource.id, email: resource.email } }, status: :created
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
