# frozen_string_literal: true

class AddSystemRoleToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :system_role, :integer, default: 0, null: false
    add_index :users, :system_role
  end
end
