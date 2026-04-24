import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { useFeedList } from "@/hooks/use-feed-list";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useFeedList", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes wrapped list payload", async () => {
    vi.spyOn(api, "get").mockResolvedValueOnce({ data: [{ _id: "post-1" }] });

    const { result } = renderHook(() => useFeedList(10, true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([{ _id: "post-1" }]);
    });
    expect(api.get).toHaveBeenCalledWith("/feed?limit=10", { withBoxId: false });
  });
});