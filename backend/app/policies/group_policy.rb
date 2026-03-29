# frozen_string_literal: true

class GroupPolicy < ApplicationPolicy
  def index? = true

  def show?
    user.super_admin? || record.member?(user)
  end

  def create? = user.super_admin?

  def update?
    user.super_admin? && record.created_by_id == user.id
  end

  def destroy?
    user.super_admin? && record.created_by_id == user.id
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
end
