# frozen_string_literal: true

require "rails_helper"
require "external_services"

RSpec.describe ExternalServices do
  describe ".configured?" do
    context "when both env vars are present" do
      it "returns true" do
        allow(ENV).to receive(:fetch).and_call_original
        with_env("SMTP2GO_USERNAME" => "user", "SMTP2GO_PASSWORD" => "pass") do
          expect(described_class.configured?(:smtp_primary)).to be true
        end
      end
    end

    context "when env vars are blank" do
      it "returns false" do
        with_env("SMTP2GO_USERNAME" => "", "SMTP2GO_PASSWORD" => "") do
          expect(described_class.configured?(:smtp_primary)).to be false
        end
      end
    end

    it "returns false for unknown key" do
      expect(described_class.configured?(:nonexistent)).to be false
    end
  end

  describe ".smtp_settings_for" do
    it "returns nil when not configured" do
      with_env("SMTP2GO_USERNAME" => nil, "SMTP2GO_PASSWORD" => nil) do
        expect(described_class.smtp_settings_for(:smtp_primary)).to be_nil
      end
    end

    it "returns smtp hash when configured" do
      with_env("SMTP2GO_USERNAME" => "user", "SMTP2GO_PASSWORD" => "pass", "SMTP_DOMAIN" => "example.com") do
        settings = described_class.smtp_settings_for(:smtp_primary)
        expect(settings).to include(
          address: "mail.smtp2go.com",
          port: 2525,
          user_name: "user",
          password: "pass",
          authentication: :plain,
          enable_starttls_auto: true
        )
      end
    end

    it "returns nil for unknown key" do
      expect(described_class.smtp_settings_for(:nonexistent)).to be_nil
    end
  end

  describe ".active_smtp_providers" do
    it "returns providers sorted by priority" do
      priorities = described_class.active_smtp_providers.map { |p| p[:priority] }
      expect(priorities).to eq(priorities.sort)
    end

    it "does not expose env var key names" do
      providers = described_class.active_smtp_providers
      providers.each do |p|
        expect(p.keys).not_to include(:env_username, :env_password)
      end
    end

    it "includes configured flag" do
      providers = described_class.active_smtp_providers
      expect(providers.first).to have_key(:configured)
    end
  end

  describe ".smtp_providers_in_order" do
    it "returns [key, name] pairs sorted by priority" do
      pairs = described_class.smtp_providers_in_order
      expect(pairs.first).to eq([ :smtp_primary, "SMTP2GO" ])
      expect(pairs.last).to eq([ :smtp_fallback, "SendPulse" ])
    end
  end

  def with_env(vars)
    old = vars.transform_values { |_| ENV[_] } rescue {}
    vars.each { |k, v| v.nil? ? ENV.delete(k.to_s) : ENV[k.to_s] = v }
    yield
  ensure
    vars.each_key { |k| old[k].nil? ? ENV.delete(k.to_s) : ENV[k.to_s] = old[k] }
  end
end
