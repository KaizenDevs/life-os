FactoryBot.define do
  factory :life_os_module do
    sequence(:name) { |n| "Module #{n}" }
    sequence(:key)  { |n| "module_#{n}" }
    enabled { true }
  end
end
