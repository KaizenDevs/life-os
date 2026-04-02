# frozen_string_literal: true

class GroupPolicy < ApplicationPolicy
  def index? = true

  def show?
    user.super_admin? || record.member?(user)
  end

  def create?
    user.super_admin? || user.created_groups.count < 3
  end

  def update?
    super_admin_creator? || record.admin?(user)
  end

  def archive?
    super_admin_creator? || record.admin?(user)
  end

  def unarchive?
    super_admin_creator?
  end

  def destroy?
    super_admin_creator?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user.super_admin?
        scope.where(created_by: user)
      else
        scope.joins(:memberships).where(memberships: { user_id: user.id })
      end
    end
  end

  private

  def super_admin_creator?
    user.super_admin? && record.created_by_id == user.id
  end
end
