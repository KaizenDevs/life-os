# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_02_165959) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_categories_on_name", unique: true
  end

  create_table "groups", force: :cascade do |t|
    t.datetime "archived_at"
    t.datetime "created_at", null: false
    t.bigint "created_by_id", null: false
    t.integer "group_type", default: 0, null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_groups_on_created_by_id"
    t.index ["group_type"], name: "index_groups_on_group_type"
  end

  create_table "memberships", force: :cascade do |t|
    t.datetime "accepted_at"
    t.datetime "created_at", null: false
    t.bigint "group_id", null: false
    t.bigint "invited_by_id"
    t.integer "role", default: 1, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["group_id"], name: "index_memberships_on_group_id"
    t.index ["invited_by_id"], name: "index_memberships_on_invited_by_id"
    t.index ["user_id", "group_id"], name: "index_memberships_on_user_id_and_group_id", unique: true
    t.index ["user_id"], name: "index_memberships_on_user_id"
  end

  create_table "providers", force: :cascade do |t|
    t.text "address"
    t.datetime "archived_at"
    t.bigint "category_id", null: false
    t.datetime "created_at", null: false
    t.string "email"
    t.bigint "group_id", null: false
    t.string "name", null: false
    t.text "notes"
    t.string "phone"
    t.datetime "updated_at", null: false
    t.index ["archived_at"], name: "index_providers_on_archived_at", where: "(archived_at IS NULL)"
    t.index ["category_id"], name: "index_providers_on_category_id"
    t.index ["group_id"], name: "index_providers_on_group_id"
    t.index ["name"], name: "index_providers_on_name"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "jti"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.integer "system_role", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["system_role"], name: "index_users_on_system_role"
  end

  add_foreign_key "groups", "users", column: "created_by_id"
  add_foreign_key "memberships", "groups"
  add_foreign_key "memberships", "users"
  add_foreign_key "memberships", "users", column: "invited_by_id"
  add_foreign_key "providers", "categories"
  add_foreign_key "providers", "groups"
end
