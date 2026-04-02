# frozen_string_literal: true

class CategoryPolicy < ApplicationPolicy
  def index?  = true
  def show?   = true
  def create? = user.super_admin?
  def update? = user.super_admin?
  def destroy? = user.super_admin?

  class Scope < ApplicationPolicy::Scope
    def resolve = scope.all
  end
end
