# frozen_string_literal: true

class LifeOsModule < ApplicationRecord
  self.table_name = "modules"

  has_many :group_modules, dependent: :destroy
  has_many :groups, through: :group_modules

  validates :name, :key, presence: true
  validates :key, uniqueness: true

  after_create :provision_to_existing_groups

  private

  def provision_to_existing_groups
    Group.find_each { |g| g.group_modules.find_or_create_by!(life_os_module: self) }
  end
end
