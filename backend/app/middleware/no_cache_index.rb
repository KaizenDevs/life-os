class NoCacheIndex
  def initialize(app)
    @app = app
  end

  def call(env)
    status, headers, body = @app.call(env)
    headers["cache-control"] = "no-cache, no-store, must-revalidate" if env["PATH_INFO"] == "/index.html"
    [status, headers, body]
  end
end
