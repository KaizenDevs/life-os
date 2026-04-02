class AddGroupIdToProviders < ActiveRecord::Migration[8.1]
  def change
    add_reference :providers, :group, null: false, foreign_key: true
  end
end
