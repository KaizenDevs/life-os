# frozen_string_literal: true

class LifeOsModulePolicy < ApplicationPolicy
  def index?  = true
  def show?   = true
  def create? = user.super_admin?
  def update? = user.super_admin?
  def destroy? = user.super_admin?

  class Scope < Scope
    def resolve
      scope.where(enabled: true)
    end
  end
end
