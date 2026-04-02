# frozen_string_literal: true

class CreateModules < ActiveRecord::Migration[8.0]
  def change
    create_table :modules do |t|
      t.string :name, null: false
      t.string :key, null: false
      t.boolean :enabled, null: false, default: true

      t.timestamps
    end

    add_index :modules, :key, unique: true
  end
end
