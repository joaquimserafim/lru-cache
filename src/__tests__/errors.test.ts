import { describe, it, expect } from "vitest";

import { LRUCacheError, InvalidCapacityError, KeyNotFoundError } from "../errors";

describe("LRUCache Errors", () => {
	describe("LRUCacheError", () => {
		it("should create a base error with correct name and message", () => {
			const message = "Test error message";
			const error = new LRUCacheError(message);

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(LRUCacheError);
			expect(error.name).toBe("LRUCacheError");
			expect(error.message).toBe(message);
		});
	});

	describe("InvalidCapacityError", () => {
		it("should create an invalid capacity error with formatted message", () => {
			const capacity = -1;
			const error = new InvalidCapacityError(capacity);

			expect(error).toBeInstanceOf(LRUCacheError);
			expect(error.name).toBe("InvalidCapacityError");
			expect(error.message).toBe(
				`Invalid capacity: ${capacity}. Capacity must be a positive integer.`
			);
		});
	});

	describe("KeyNotFoundError", () => {
		it("should create a key not found error with stringified key", () => {
			const key = { id: 123 };
			const error = new KeyNotFoundError(key);

			expect(error).toBeInstanceOf(LRUCacheError);
			expect(error.name).toBe("KeyNotFoundError");
			expect(error.message).toBe(`Key not found: ${JSON.stringify(key)}`);
		});

		it("should handle primitive key types", () => {
			const error = new KeyNotFoundError(42);

			expect(error).toBeInstanceOf(LRUCacheError);
			expect(error.name).toBe("KeyNotFoundError");
			expect(error.message).toBe("Key not found: 42");
		});
	});
});
