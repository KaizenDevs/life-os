# frozen_string_literal: true

FactoryBot.define do
  factory :provider do
    sequence(:name) { |n| "Provider #{n}" }
    phone { "+1 555 123 4567" }
    email { "contact@example.com" }
    address { "123 Main St" }
    notes { nil }
    association :group
    association :category

    trait :mechanic do
      category { Category.find_or_create_by!(name: "mechanic") }
    end

    trait :curtains do
      category { Category.find_or_create_by!(name: "curtains") }
    end

    trait :archived do
      archived_at { 1.day.ago }
    end
  end
end
