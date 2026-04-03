# frozen_string_literal: true

class ProviderPolicy < ApplicationPolicy
  # viewer, member, admin can all read
  def index?  = member_of_group?
  def show?   = member_of_group?

  # member and admin can write
  def create?   = writable_member?
  def update?   = writable_member?
  def archive?  = writable_member?
  def unarchive? = writable_member?

  # admin only for hard delete
  def destroy? = group_admin?

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.joins(:group).where(groups: { id: user.group_ids })
    end
  end

  private

  def membership
    @membership ||= record.group.memberships.find_by(user: user)
  end

  def member_of_group?
    user.super_admin? || membership.present?
  end

  def writable_member?
    user.super_admin? || (membership.present? && (membership.admin? || membership.member?))
  end

  def group_admin?
    user.super_admin? || membership&.admin?
  end
end
