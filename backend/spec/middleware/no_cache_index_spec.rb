require "spec_helper"
require "rack/mock_request"
require_relative "../../app/middleware/no_cache_index"

RSpec.describe NoCacheIndex do
  let(:inner_app) { ->(env) { [200, { "cache-control" => "public, max-age=31556952" }, []] } }
  let(:middleware) { described_class.new(inner_app) }

  it "sets no-cache on /index.html" do
    env = Rack::MockRequest.env_for("/index.html")
    _, headers, = middleware.call(env)
    expect(headers["cache-control"]).to eq("no-cache, no-store, must-revalidate")
  end

  it "leaves cache-control unchanged for other paths" do
    env = Rack::MockRequest.env_for("/assets/app-abc123.js")
    _, headers, = middleware.call(env)
    expect(headers["cache-control"]).to eq("public, max-age=31556952")
  end
end
