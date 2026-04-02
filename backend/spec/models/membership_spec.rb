# frozen_string_literal: true

require "rails_helper"

RSpec.describe Membership, type: :model do
  describe "last admin protection" do
    let(:super_admin) { create(:user, :super_admin) }
    let(:group)       { create(:group, created_by: super_admin) }
    let!(:admin_membership) { create(:membership, :admin, group: group, user: create(:user)) }

    context "when the group has only one admin" do
      it "prevents destroying the last admin membership" do
        expect { admin_membership.destroy }.not_to change(Membership, :count)
        expect(admin_membership.errors[:base]).to include("group must have at least one admin")
      end

      it "prevents demoting the last admin to member" do
        admin_membership.role = :member
        expect(admin_membership).not_to be_valid
        expect(admin_membership.errors[:base]).to include("group must have at least one admin")
      end

      it "prevents demoting the last admin to viewer" do
        admin_membership.role = :viewer
        expect(admin_membership).not_to be_valid
        expect(admin_membership.errors[:base]).to include("group must have at least one admin")
      end
    end

    context "when the group has more than one admin" do
      let!(:second_admin) { create(:membership, :admin, group: group, user: create(:user)) }

      it "allows removing one admin when another exists" do
        expect { admin_membership.destroy }.to change(Membership, :count).by(-1)
      end

      it "allows demoting one admin when another exists" do
        admin_membership.role = :member
        expect(admin_membership).to be_valid
      end
    end
  end
end
