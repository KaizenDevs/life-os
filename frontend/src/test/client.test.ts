import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch } from "../api/client";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    sessionStorage.clear();
  });

  it("adds Authorization header when token exists", async () => {
    sessionStorage.setItem("token", "abc123");
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ data: [] }), { status: 200 })
    );

    await apiFetch("/groups");

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect((options?.headers as Record<string, string>)["Authorization"]).toBe(
      "Bearer abc123"
    );
  });

  it("omits Authorization header when no token", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await apiFetch("/categories");

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(
      (options?.headers as Record<string, string>)["Authorization"]
    ).toBeUndefined();
  });

  it("throws on non-ok response with error body", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: ["Not found"] }), { status: 404 })
    );

    await expect(apiFetch("/groups/99")).rejects.toMatchObject({
      status: 404,
      errors: ["Not found"],
    });
  });

  it("returns undefined for 204 No Content", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));

    const result = await apiFetch("/groups/1");
    expect(result).toBeUndefined();
  });

  it("prefixes the path with /api/v1", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await apiFetch("/groups");

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/v1/groups");
  });
});
