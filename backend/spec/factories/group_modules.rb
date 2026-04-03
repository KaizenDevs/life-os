FactoryBot.define do
  factory :group_module do
    association :group
    association :life_os_module
    enabled { true }
  end
end
