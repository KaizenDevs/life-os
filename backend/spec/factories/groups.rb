FactoryBot.define do
  factory :group do
    sequence(:name) { |n| "Group #{n}" }
    group_type { :household }
    association :created_by, factory: [:user, :super_admin]

    trait :company do
      group_type { :company }
    end
  end
end
