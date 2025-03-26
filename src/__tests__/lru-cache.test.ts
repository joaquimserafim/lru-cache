import { describe, it, expect } from "vitest";

import { LRUCache } from "../lru-cache";
import { InvalidCapacityError, KeyNotFoundError, LRUCacheError } from "../errors";

//
// LRUCache tests
//

describe("LRUCache", () => {
	describe("constructor", () => {
		it("should create a cache with valid capacity", () => {
			const cache = new LRUCache<string, number>(3);
			expect(cache.size()).toBe(0);
		});

		it("should throw error for invalid capacity", () => {
			expect(() => new LRUCache<string, number>(-1)).toThrow(InvalidCapacityError);
			expect(() => new LRUCache<string, number>(0)).toThrow(InvalidCapacityError);
		});
	});

	describe("put and get", () => {
		it("should store and retrieve values", () => {
			const cache = new LRUCache<string, number>(3);

			cache.put("a", 1);
			expect(cache.get("a")).toBe(1);
		});

		it("should update existing values", () => {
			const cache = new LRUCache<string, number>(3);

			cache.put("a", 1);
			cache.put("a", 2);
			expect(cache.get("a")).toBe(2);
		});

		it("should throw error for non-existent key", () => {
			const cache = new LRUCache<string, number>(3);

			expect(() => cache.get("nonexistent")).toThrow(KeyNotFoundError);
		});

		it("should evict least recently used item when capacity is reached", () => {
			const cache = new LRUCache<string, number>(2);

			cache.put("a", 1);
			cache.put("b", 2);
			expect(cache.get("a")).toBe(1); // Make "a" most recently used

			cache.put("c", 3); // Should evict "b"
			expect(() => cache.get("b")).toThrow(KeyNotFoundError);
			expect(cache.get("a")).toBe(1);
			expect(cache.get("c")).toBe(3);
		});
	});

	describe("getSafe", () => {
		it("should return undefined for non-existent key", () => {
			const cache = new LRUCache<string, number>(3);
			expect(cache.getSafe("nonexistent")).toBeUndefined();
		});

		it("should return value for existing key", () => {
			const cache = new LRUCache<string, number>(3);
			cache.put("a", 1);
			expect(cache.getSafe("a")).toBe(1);
		});
	});

	describe("has", () => {
		it("should return true for existing key", () => {
			const cache = new LRUCache<string, number>(3);
			cache.put("a", 1);
			expect(cache.has("a")).toBe(true);
		});

		it("should return false for non-existent key", () => {
			const cache = new LRUCache<string, number>(3);
			expect(cache.has("nonexistent")).toBe(false);
		});
	});

	describe("clear", () => {
		it("should remove all items", () => {
			const cache = new LRUCache<string, number>(3);
			cache.put("a", 1);
			cache.put("b", 2);

			cache.clear();
			expect(cache.size()).toBe(0);
			expect(cache.has("a")).toBe(false);
			expect(cache.has("b")).toBe(false);
		});

		it("should handle errors in clear operation", () => {
			const cache = new LRUCache<string, number>(2);
			cache.put("a", 1);
			cache.put("b", 2);

			// Corrupt the Map object itself to cause clear() to fail
			(cache as any).cache = null;

			expect(() => cache.clear()).toThrow(LRUCacheError);
		});
	});

	describe("keys", () => {
		it("should return keys in order of most to least recently used", () => {
			const cache = new LRUCache<string, number>(3);

			cache.put("a", 1);
			cache.put("b", 2);
			cache.put("c", 3);

			// Access "a" to make it most recently used
			cache.get("a");

			expect(cache.keys()).toEqual(["a", "c", "b"]);
		});

		it("should handle errors in keys operation", () => {
			const cache = new LRUCache<string, number>(2);
			cache.put("a", 1);
			cache.put("b", 2);

			// Corrupt the internal state by breaking the chain
			(cache as any).head.next = null;
			(cache as any).tail.prev = null;

			// This should fail because the chain is broken
			expect(() => cache.keys()).toThrow(LRUCacheError);
		});

		it("should handle non-Error objects in get and keys operations", () => {
			const cache = new LRUCache<string, number>(2);
			cache.put("a", 1);

			// For get: Mock removeNode to throw a non-Error
			(cache as any).removeNode = () => {
				throw "string error"; // Explicitly throw a string to hit the "Unknown error" path
			};
			expect(() => cache.get("a")).toThrow(LRUCacheError);

			// For keys: Create a broken chain that will throw a non-Error
			(cache as any).head = {
				next: {
					key: "test",
					next: undefined // This will cause keys() to fail with undefined access
				}
			};
			expect(() => cache.keys()).toThrow(LRUCacheError);
		});

		it("should handle non-Error objects in keys operation", () => {
			const cache = new LRUCache<string, number>(2);

			// Create a chain that will cause keys() to throw a non-Error object
			(cache as any).head = {
				next: {
					// When keys() tries to traverse this chain, accessing 'next' will throw a non-Error
					get next() {
						throw "string error"; // Explicitly throw a string to hit the "Unknown error" path
					},
					key: "test"
				}
			};

			expect(() => cache.keys()).toThrow(LRUCacheError);
		});
	});

	describe("size", () => {
		it("should return correct size", () => {
			const cache = new LRUCache<string, number>(3);
			expect(cache.size()).toBe(0);

			cache.put("a", 1);
			expect(cache.size()).toBe(1);

			cache.put("b", 2);
			expect(cache.size()).toBe(2);

			cache.put("c", 3);
			expect(cache.size()).toBe(3);

			// Should not exceed capacity
			cache.put("d", 4);
			expect(cache.size()).toBe(3);
		});
	});

	describe("error handling", () => {
		it("should throw error when putting null/undefined key", () => {
			const cache = new LRUCache<string | null, number>(2);
			expect(() => cache.put(null, 1)).toThrow(LRUCacheError);
			expect(() => cache.put(undefined as unknown as string, 1)).toThrow(LRUCacheError);
		});

		it("should throw error on invalid node state", () => {
			const cache = new LRUCache<string, number>(2);
			cache.put("a", 1);
			cache.put("b", 2);

			// Force invalid state by clearing cache
			cache.clear();
			expect(() => cache.get("a")).toThrow(LRUCacheError);
		});

		it("should handle errors in get operation", () => {
			const cache = new LRUCache<string, number>(2);
			cache.put("a", 1);

			// Force error by clearing cache
			cache.clear();
			expect(() => cache.get("a")).toThrow(LRUCacheError);
		});

		it("should handle errors in put operation", () => {
			const cache = new LRUCache<string, number>(2);

			// Force error by corrupting the internal state
			cache.put("a", 1);
			cache.put("b", 2);
			cache.clear();

			// Corrupt the internal state by setting head.next to null
			(cache as any).head.next = null;

			expect(() => cache.put("c", 3)).toThrow(LRUCacheError);
		});

		it("should handle errors in getSafe operation", () => {
			const cache = new LRUCache<string, number>(2);
			cache.put("a", 1);

			// Corrupt the internal state to force an error that's not KeyNotFoundError
			(cache as any).head = null;

			expect(() => cache.getSafe("a")).toThrow(LRUCacheError);
		});

		it("should handle errors in addToFront operation", () => {
			const cache = new LRUCache<string, number>(2);

			// More severe corruption of the internal state
			(cache as any).head = null;

			expect(() => cache.put("a", 1)).toThrow(LRUCacheError);
		});

		it("should handle non-KeyNotFoundError in get operation", () => {
			const cache = new LRUCache<string, number>(2);
			cache.put("a", 1);

			// Corrupt the node to force a different kind of error
			const node = (cache as any).cache.get("a");
			node.prev = undefined;

			expect(() => cache.get("a")).toThrow(LRUCacheError);
		});

		it("should handle non-Error objects in put, clear, and keys operations", () => {
			const cache = new LRUCache<string, number>(2);

			// Test put with non-Error object
			(cache as any).addToFront = () => {
				throw { custom: "not an error" };
			};
			expect(() => cache.put("a", 1)).toThrow(LRUCacheError);

			// Test clear with non-Error object
			(cache as any).cache = {
				clear: () => {
					throw { custom: "not an error" };
				}
			};
			expect(() => cache.clear()).toThrow(LRUCacheError);

			// Test keys with non-Error object
			(cache as any).head = {
				next: {
					key: "test",
					next: null // This will cause the keys() method to throw our non-Error
				}
			};
			expect(() => cache.keys()).toThrow(LRUCacheError);
		});
	});

	describe("edge cases", () => {
		it("should handle removing last item", () => {
			const cache = new LRUCache<string, number>(2);
			cache.put("a", 1);
			cache.put("b", 2);
			cache.clear();
			cache.put("c", 3);
			expect(cache.get("c")).toBe(3);
		});

		it("should handle chain maintenance after multiple operations", () => {
			const cache = new LRUCache<string, number>(3);
			cache.put("a", 1);
			cache.put("b", 2);
			cache.put("c", 3);
			cache.get("a"); // move to front
			cache.put("d", 4); // should evict b
			expect(cache.keys()).toEqual(["d", "a", "c"]);
		});
	});
});
