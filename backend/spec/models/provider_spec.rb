# frozen_string_literal: true

require "rails_helper"

RSpec.describe Provider, type: :model do
  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:category) }
    it { is_expected.to validate_inclusion_of(:category).in_array(Provider::CATEGORIES) }
  end

  describe "scopes" do
    describe ".active" do
      it "returns only non-archived providers" do
        active = create(:provider, archived_at: nil)
        create(:provider, :archived)
        expect(Provider.active).to eq([active])
      end
    end

    describe ".archived" do
      it "returns only archived providers" do
        create(:provider)
        archived = create(:provider, :archived)
        expect(Provider.archived).to eq([archived])
      end
    end

    describe ".search" do
      it "returns all when query is blank" do
        create(:provider, name: "Acme")
        expect(Provider.search("").count).to eq(1)
        expect(Provider.search(nil).count).to eq(1)
      end

      it "filters by name" do
        create(:provider, name: "Acme Plumbing")
        create(:provider, name: "Other")
        expect(Provider.search("Acme").count).to eq(1)
      end

      it "filters by notes" do
        create(:provider, name: "A", notes: "great plumber")
        create(:provider, name: "B", notes: "bad")
        expect(Provider.search("plumber").count).to eq(1)
      end
    end
  end

  describe "#archive!" do
    it "sets archived_at" do
      provider = create(:provider)
      expect { provider.archive! }.to change { provider.reload.archived_at }.from(nil).to(be_within(1.second).of(Time.current))
    end
  end

  describe "#unarchive!" do
    it "clears archived_at" do
      provider = create(:provider, :archived)
      expect { provider.unarchive! }.to change { provider.reload.archived_at }.to(nil)
    end
  end
end
