import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "../../src/lib/api";
import { currentUser } from "../../src/lib/Auth";

vi.mock("../../src/lib/Auth", () => ({
  currentUser: vi.fn(),
}));

describe("api()", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    globalThis.fetch = vi.fn(); // <-- updated
  });

  it("includes auth headers when user is logged in", async () => {
    vi.mocked(currentUser).mockReturnValue({
      username: "alice",
      token: "abc123",
    });

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ success: true })),
    } as any);

    const data = await api("/api/test", { method: "GET" });
    expect(data).toEqual({ success: true });

    expect(fetch).toHaveBeenCalledWith("/api/test", expect.objectContaining({
      headers: expect.objectContaining({
        "X-Username": "alice",
        Authorization: "Bearer abc123",
      }),
    }));
  });

  it("parses text() JSON response", async () => {
    vi.mocked(currentUser).mockReturnValue(null);

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{ "message": "hello" }'),
    } as any);

    const response = await api("/api/hello");
    expect(response).toEqual({ message: "hello" });
  });

  it("falls back to json() if text() doesn't exist", async () => {
    vi.mocked(currentUser).mockReturnValue(null);

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    } as any);

    const response = await api("/api/fallback");
    expect(response).toEqual({ ok: true });
  });

  it("throws an error when response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: () => Promise.resolve(JSON.stringify({ error: "Not allowed" })),
      statusText: "Forbidden",
    } as any);

    await expect(api("/api/fail")).rejects.toThrow("Not allowed");
  });

  it("throws generic error if no message available", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: () => Promise.resolve(""),
      statusText: "Bad Request",
    } as any);

    await expect(api("/api/unknown")).rejects.toThrow("Bad Request");
  });

  it("sends JSON body for POST", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("{}"),
    } as any);

    await api("/api/create", {
      method: "POST",
      body: { name: "Test" },
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/create",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Test" }),
      })
    );
  });
});
