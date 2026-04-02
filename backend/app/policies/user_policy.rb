# frozen_string_literal: true

class UserPolicy < ApplicationPolicy
  def index? = true

  class Scope < ApplicationPolicy::Scope
    def resolve = scope.all
  end
end
