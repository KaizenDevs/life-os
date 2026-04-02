import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { apiFetch } from "../api/client";

describe("apiFetch", () => {
  const fetchMock = mock<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockClear();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    sessionStorage.clear();
  });

  afterEach(() => {
    mock.restore();
  });

  it("adds Authorization header when token exists", async () => {
    sessionStorage.setItem("token", "abc123");
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: [] }), { status: 200 })
    );

    await apiFetch("/groups");

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)["Authorization"]).toBe(
      "Bearer abc123"
    );
  });

  it("omits Authorization header when no token", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await apiFetch("/categories");

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(
      (options.headers as Record<string, string>)["Authorization"]
    ).toBeUndefined();
  });

  it("throws on non-ok response with error body", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: ["Not found"] }), { status: 404 })
    );

    await expect(apiFetch("/groups/99")).rejects.toMatchObject({
      status: 404,
      errors: ["Not found"],
    });
  });

  it("returns undefined for 204 No Content", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    const result = await apiFetch("/groups/1");
    expect(result).toBeUndefined();
  });

  it("prefixes the path with /api/v1", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await apiFetch("/groups");

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe("/api/v1/groups");
  });
});
