# frozen_string_literal: true

class Membership < ApplicationRecord
  enum :role, { viewer: 0, member: 1, admin: 2 }

  belongs_to :user
  belongs_to :group
  belongs_to :invited_by, class_name: "User", optional: true

  validates :user_id, uniqueness: { scope: :group_id, message: "is already a member of this group" }
  validates :role, presence: true
  validate :group_must_retain_an_admin, if: :role_changed?
  before_destroy :ensure_group_retains_an_admin

  scope :accepted, -> { where.not(accepted_at: nil) }
  scope :pending, -> { where(accepted_at: nil) }

  def accepted?
    accepted_at.present?
  end

  def accept!
    update!(accepted_at: Time.current)
  end

  private

  def group_must_retain_an_admin
    return unless admin_was = role_was == "admin"
    remaining_admins = group.memberships.where(role: :admin).where.not(id: id).count
    errors.add(:base, "group must have at least one admin") if remaining_admins == 0
  end

  def ensure_group_retains_an_admin
    return unless admin?
    remaining_admins = group.memberships.where(role: :admin).where.not(id: id).count
    if remaining_admins == 0
      errors.add(:base, "group must have at least one admin")
      throw :abort
    end
  end
end
