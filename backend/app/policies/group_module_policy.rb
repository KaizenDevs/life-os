# frozen_string_literal: true

class GroupModulePolicy < ApplicationPolicy
  def index?  = true
  def update? = user.super_admin? || record.group.memberships.where(user:, role: :admin).exists?

  class Scope < ApplicationPolicy::Scope
    def resolve = scope.all
  end
end
