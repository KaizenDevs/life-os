class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  before_validation :set_jti, on: :create

  private

  def set_jti
    self.jti ||= SecureRandom.uuid
  end
end
