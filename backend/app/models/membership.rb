# frozen_string_literal: true

class Membership < ApplicationRecord
  enum :role, { viewer: 0, member: 1, admin: 2 }

  belongs_to :user
  belongs_to :group
  belongs_to :invited_by, class_name: "User", optional: true

  validates :user_id, uniqueness: { scope: :group_id, message: "is already a member of this group" }
  validates :role, presence: true

  scope :accepted, -> { where.not(accepted_at: nil) }
  scope :pending, -> { where(accepted_at: nil) }

  def accepted?
    accepted_at.present?
  end

  def accept!
    update!(accepted_at: Time.current)
  end
end
