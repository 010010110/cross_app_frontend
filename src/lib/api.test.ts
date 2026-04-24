import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";

describe("api client", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it("sends auth and box headers by default", async () => {
    localStorage.setItem("auth_token", "token-123");
    localStorage.setItem("selected_box_id", "box-1");

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    ) as unknown as typeof fetch;

    await api.get<{ ok: boolean }>("/classes/today");

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, options] = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer token-123");
    expect(options.headers["x-box-id"]).toBe("box-1");
  });

  it("does not send box header when withBoxId is false", async () => {
    localStorage.setItem("selected_box_id", "box-2");

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    ) as unknown as typeof fetch;

    await api.get<unknown>("/feed", { withBoxId: false });

    const [, options] = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.headers["x-box-id"]).toBeUndefined();
  });

  it("throws normalized error payload when request fails", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      })
    ) as unknown as typeof fetch;

    await expect(api.get<unknown>("/private")).rejects.toMatchObject({
      status: 401,
      message: "Unauthorized",
    });
  });
});