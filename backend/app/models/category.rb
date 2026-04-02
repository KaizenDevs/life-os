# frozen_string_literal: true

class Category < ApplicationRecord
  has_many :providers, dependent: :restrict_with_error

  validates :name, presence: true, uniqueness: true
end
