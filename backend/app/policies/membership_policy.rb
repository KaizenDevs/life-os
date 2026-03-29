# frozen_string_literal: true

class MembershipPolicy < ApplicationPolicy
  def index?
    user.super_admin? || record.group.member?(user)
  end

  def create?
    (user.super_admin? && record.group.created_by_id == user.id) ||
      record.group.admin?(user)
  end

  def update?
    (user.super_admin? && record.group.created_by_id == user.id) ||
      record.group.admin?(user)
  end

  def destroy?
    (user.super_admin? && record.group.created_by_id == user.id) ||
      record.group.admin?(user)
  end

  def accept?
    record.user_id == user.id
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user.super_admin?
        scope.joins(:group).where(groups: { created_by_id: user.id })
      else
        scope.joins(:group).where(groups: { id: user.group_ids })
      end
    end
  end
end
