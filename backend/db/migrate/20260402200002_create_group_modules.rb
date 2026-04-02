# frozen_string_literal: true

class CreateGroupModules < ActiveRecord::Migration[8.0]
  def change
    create_table :group_modules do |t|
      t.references :group, null: false, foreign_key: true
      t.references :module, null: false, foreign_key: true
      t.boolean :enabled, null: false, default: true

      t.timestamps
    end

    add_index :group_modules, [:group_id, :module_id], unique: true
  end
end
