class Users::PasswordsController < Devise::PasswordsController
  respond_to :json

  # POST /users/password
  def create
    user = User.find_by(email: resource_params[:email].to_s.downcase)

    if user
      user.send_reset_password_instructions
    end

    # Always respond with success to avoid email enumeration
    render json: { message: "If that email exists, a reset link has been sent." }, status: :ok
  end

  # PUT /users/password
  def update
    self.resource = resource_class.reset_password_by_token(resource_params)

    if resource.errors.empty?
      render json: { message: "Password updated successfully." }, status: :ok
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def resource_params
    params.require(:user).permit(:email, :password, :password_confirmation, :reset_password_token)
  end
end
