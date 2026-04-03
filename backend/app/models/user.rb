class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  enum :system_role, { user: 0, super_admin: 1 }

  has_many :memberships, dependent: :destroy
  has_many :groups, through: :memberships
  has_many :created_groups, class_name: "Group", foreign_key: :created_by_id, dependent: :destroy

  before_validation :set_jti, on: :create

  def jwt_payload
    super.merge("system_role" => system_role, "email" => email)
  end

  private

  def set_jti
    self.jti ||= SecureRandom.uuid
  end
end
