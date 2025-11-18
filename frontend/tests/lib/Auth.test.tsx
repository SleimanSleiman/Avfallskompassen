import { describe, it, expect, vi, beforeEach } from "vitest";
import { login, register, currentUser, logout } from "../../src/lib/Auth";
import { post } from "../../src/lib/api";

vi.mock("../../src/lib/api", () => ({
  post: vi.fn(),
}));

describe("Auth library", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it("login() stores user data and dispatches event on success", async () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    vi.mocked(post).mockResolvedValue({
      success: true,
      message: "Logged in",
      username: "alice",
      role: "admin",
      token: "abc123",
    });

    const res = await login("alice", "secret");

    expect(res.success).toBe(true);
    expect(localStorage.getItem("auth_user")).toEqual(
      JSON.stringify({ username: "alice", role: "admin", token: "abc123" })
    );
    expect(dispatchSpy).toHaveBeenCalledWith(new Event("auth-change"));
  });

  it("login() does NOT store user data on failure", async () => {
    vi.mocked(post).mockResolvedValue({
      success: false,
      message: "Invalid",
    });

    const res = await login("bad", "creds");

    expect(res.success).toBe(false);
    expect(localStorage.getItem("auth_user")).toBeNull();
  });

  it("register() stores user data and dispatches event on success", async () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    vi.mocked(post).mockResolvedValue({
      success: true,
      message: "Registered!",
      username: "bob",
      role: "user",
      token: "xyz789",
    });

    const res = await register("bob", "pass");

    expect(res.success).toBe(true);
    expect(localStorage.getItem("auth_user")).toEqual(
      JSON.stringify({ username: "bob", role: "user", token: "xyz789" })
    );
    expect(dispatchSpy).toHaveBeenCalledWith(new Event("auth-change"));
  });

  it("currentUser() returns parsed user", () => {
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ username: "alice", role: "admin", token: "abc123" })
    );

    expect(currentUser()).toEqual({
      username: "alice",
      role: "admin",
      token: "abc123",
    });
  });

  it("currentUser() returns null when no user stored", () => {
    expect(currentUser()).toBeNull();
  });

  it("logout() clears user and dispatches event", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    localStorage.setItem(
      "auth_user",
      JSON.stringify({ username: "test", role: "admin", token: "111" })
    );

    logout();

    expect(localStorage.getItem("auth_user")).toBeNull();
    expect(dispatchSpy).toHaveBeenCalledWith(new Event("auth-change"));
  });
});
