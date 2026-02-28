# frozen_string_literal: true

class CreateProviders < ActiveRecord::Migration[8.1]
  def change
    create_table :providers do |t|
      t.string :name, null: false
      t.string :category, null: false
      t.string :phone
      t.string :email
      t.text :address
      t.text :notes
      t.datetime :archived_at

      t.timestamps
    end

    add_index :providers, :name
    add_index :providers, :category
    add_index :providers, :archived_at, where: "archived_at IS NULL"
  end
end
