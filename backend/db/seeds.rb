# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

%w[plumber mechanic curtains electrician painter other].each do |name|
  Category.find_or_create_by!(name: name)
end

LifeOsModule.find_or_create_by!(key: "contacts_book") do |m|
  m.name = "Contacts Book"
  m.enabled = true
end
