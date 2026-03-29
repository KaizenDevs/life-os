FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    password_confirmation { "password123" }
    system_role { :user }

    trait :super_admin do
      system_role { :super_admin }
    end
  end
end
