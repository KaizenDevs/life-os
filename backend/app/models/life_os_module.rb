# frozen_string_literal: true

class LifeOsModule < ApplicationRecord
  self.table_name = "modules"

  has_many :group_modules, dependent: :destroy
  has_many :groups, through: :group_modules

  validates :name, :key, presence: true
  validates :key, uniqueness: true
end
