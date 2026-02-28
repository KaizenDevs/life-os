# frozen_string_literal: true

require "rails_helper"

RSpec.describe User, type: :model do
  describe "devise modules" do
    it { is_expected.to respond_to(:email) }
    it { is_expected.to respond_to(:encrypted_password) }
  end

  describe "jti" do
    it "sets jti on create" do
      user = create(:user)
      expect(user.jti).to be_present
      expect(user.jti.length).to eq(36) # UUID format
    end
  end
end
