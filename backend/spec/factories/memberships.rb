FactoryBot.define do
  factory :membership do
    association :user
    association :group
    role { :member }
    association :invited_by, factory: :user

    trait :admin do
      role { :admin }
    end

    trait :viewer do
      role { :viewer }
    end

    trait :accepted do
      accepted_at { Time.current }
    end
  end
end
