# frozen_string_literal: true

class CreateMemberships < ActiveRecord::Migration[8.1]
  def change
    create_table :memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :group, null: false, foreign_key: true
      t.integer :role, null: false, default: 1
      t.references :invited_by, foreign_key: { to_table: :users }
      t.datetime :accepted_at

      t.timestamps
    end

    add_index :memberships, [:user_id, :group_id], unique: true
  end
end
