# frozen_string_literal: true

class CreateCategories < ActiveRecord::Migration[8.1]
  DEFAULT_CATEGORIES = %w[plumber mechanic curtains electrician painter other].freeze

  def up
    create_table :categories do |t|
      t.string :name, null: false
      t.timestamps
    end
    add_index :categories, :name, unique: true

    DEFAULT_CATEGORIES.each do |name|
      execute "INSERT INTO categories (name, created_at, updated_at) VALUES (#{connection.quote(name)}, NOW(), NOW())"
    end

    add_reference :providers, :category, null: true, foreign_key: true

    execute <<~SQL
      UPDATE providers p
      SET category_id = c.id
      FROM categories c
      WHERE c.name = p.category
    SQL

    change_column_null :providers, :category_id, false

    remove_index :providers, :category
    remove_column :providers, :category
  end

  def down
    add_column :providers, :category, :string
    add_index :providers, :category

    execute <<~SQL
      UPDATE providers p
      SET category = c.name
      FROM categories c
      WHERE c.id = p.category_id
    SQL

    change_column_null :providers, :category, false
    remove_reference :providers, :category, foreign_key: true
    drop_table :categories
  end
end
