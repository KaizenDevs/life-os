# frozen_string_literal: true

class MembershipPolicy < ApplicationPolicy
  def index?
    user.super_admin? || record.group.member?(user)
  end

  def create?
    user.super_admin? || record.group.admin?(user)
  end

  def update?
    user.super_admin? || record.group.admin?(user)
  end

  def destroy?
    user.super_admin? || record.group.admin?(user)
  end

  def accept?
    record.user_id == user.id
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      user.super_admin? ? scope.all : scope.joins(:group).where(groups: { id: user.group_ids })
    end
  end
end
