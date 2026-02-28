# frozen_string_literal: true

FactoryBot.define do
  factory :provider do
    sequence(:name) { |n| "Provider #{n}" }
    category { "plumber" }
    phone { "+1 555 123 4567" }
    email { "contact@example.com" }
    address { "123 Main St" }
    notes { nil }

    trait :mechanic do
      category { "mechanic" }
    end

    trait :curtains do
      category { "curtains" }
    end

    trait :archived do
      archived_at { 1.day.ago }
    end
  end
end
