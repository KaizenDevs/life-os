# frozen_string_literal: true

class Provider < ApplicationRecord
  CATEGORIES = %w[plumber mechanic curtains electrician painter other].freeze

  validates :name, presence: true
  validates :category, presence: true, inclusion: { in: CATEGORIES }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true

  scope :active, -> { where(archived_at: nil) }
  scope :archived, -> { where.not(archived_at: nil) }
  scope :search, ->(query) {
    return all if query.blank?
    sanitized = ActiveRecord::Base.sanitize_sql_like(query)
    where("name ILIKE :q OR notes ILIKE :q", q: "%#{sanitized}%")
  }

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
