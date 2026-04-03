# frozen_string_literal: true

class Group < ApplicationRecord
  enum :group_type, { household: 0, company: 1 }

  belongs_to :created_by, class_name: "User"
  has_many :memberships, dependent: :delete_all
  has_many :users, through: :memberships
  has_many :providers, dependent: :destroy
  has_many :group_modules, dependent: :destroy
  has_many :life_os_modules, through: :group_modules

  after_create :provision_modules

  validates :name, presence: true
  validates :group_type, presence: true

  def provision_modules
    LifeOsModule.where(enabled: true).find_each do |mod|
      group_modules.find_or_create_by!(life_os_module: mod)
    end
  end

  def admin?(user)
    memberships.exists?(user: user, role: :admin)
  end

  def member?(user)
    memberships.exists?(user: user)
  end

  def archived?
    archived_at.present?
  end

  def archive!
    update!(archived_at: Time.current)
  end

  def unarchive!
    update!(archived_at: nil)
  end
end
