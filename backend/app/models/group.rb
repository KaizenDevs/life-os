# frozen_string_literal: true

class Group < ApplicationRecord
  enum :group_type, { household: 0, company: 1 }

  belongs_to :created_by, class_name: "User"
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  has_many :providers, dependent: :destroy

  validates :name, presence: true
  validates :group_type, presence: true

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
