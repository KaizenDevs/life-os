# frozen_string_literal: true

class GroupModule < ApplicationRecord
  belongs_to :group
  belongs_to :life_os_module, foreign_key: :module_id

  validates :group_id, uniqueness: { scope: :module_id }
end
