import { describe, expect, it } from "vitest";
import { normalizeArrayPayload, normalizeObjectPayload } from "@/lib/response";

describe("normalizeArrayPayload", () => {
  it("returns payload when already array", () => {
    const payload = [{ id: "a" }, { id: "b" }];

    expect(normalizeArrayPayload<{ id: string }>(payload)).toEqual(payload);
  });

  it("supports wrapped array in items/data/results", () => {
    expect(normalizeArrayPayload<{ id: string }>({ items: [{ id: "a" }] })).toEqual([{ id: "a" }]);
    expect(normalizeArrayPayload<{ id: string }>({ data: [{ id: "b" }] })).toEqual([{ id: "b" }]);
    expect(normalizeArrayPayload<{ id: string }>({ results: [{ id: "c" }] })).toEqual([{ id: "c" }]);
  });

  it("returns empty array for invalid payload", () => {
    expect(normalizeArrayPayload<{ id: string }>(null)).toEqual([]);
    expect(normalizeArrayPayload<{ id: string }>("invalid")).toEqual([]);
    expect(normalizeArrayPayload<{ id: string }>({})).toEqual([]);
  });
});

describe("normalizeObjectPayload", () => {
  it("returns direct object payload", () => {
    const payload = { id: "a", name: "John" };
    expect(normalizeObjectPayload<{ id: string; name: string }>(payload)).toEqual(payload);
  });

  it("supports wrapped object in data/item/result", () => {
    expect(normalizeObjectPayload<{ id: string }>({ data: { id: "a" } })).toEqual({ id: "a" });
    expect(normalizeObjectPayload<{ id: string }>({ item: { id: "b" } })).toEqual({ id: "b" });
    expect(normalizeObjectPayload<{ id: string }>({ result: { id: "c" } })).toEqual({ id: "c" });
  });

  it("returns null for invalid payload", () => {
    expect(normalizeObjectPayload<{ id: string }>(null)).toBeNull();
    expect(normalizeObjectPayload<{ id: string }>(42)).toBeNull();
  });
});