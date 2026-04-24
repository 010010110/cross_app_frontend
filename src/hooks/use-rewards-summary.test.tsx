import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { useRewardsSummary } from "@/hooks/use-rewards-summary";

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

const summaryPayload = {
  currentStreak: 5,
  longestStreak: 8,
  lastActivityDate: "2026-04-24",
  availableFreezes: 1,
  totalXp: 250,
  streakState: "ACTIVE",
  daysSinceLastActivity: 0,
  nextMilestone: 10,
};

describe("useRewardsSummary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts wrapped object payload in data", async () => {
    vi.spyOn(api, "get").mockResolvedValueOnce({ data: summaryPayload });

    const { result } = renderHook(() => useRewardsSummary("box-1", true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(summaryPayload);
  });

  it("returns null when payload is invalid", async () => {
    vi.spyOn(api, "get").mockResolvedValueOnce({ data: { currentStreak: "invalid" } });

    const { result } = renderHook(() => useRewardsSummary("box-1", true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});