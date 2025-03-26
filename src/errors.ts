// Base error class for all LRU Cache related errors
// Extends the built-in Error class to maintain proper error inheritance
export class LRUCacheError extends Error {
	constructor(message: string) {
		super(message); // Pass message to Error constructor
		this.name = "LRUCacheError"; // Set custom name for error identification
	}
}

// Specific error for invalid capacity values
// Extends LRUCacheError to maintain error hierarchy
export class InvalidCapacityError extends LRUCacheError {
	constructor(capacity: number) {
		// Format error message with the invalid capacity value
		super(`Invalid capacity: ${capacity}. Capacity must be a positive integer.`);
		this.name = "InvalidCapacityError"; // Set specific error name
	}
}

// Specific error for when a key is not found in the cache
// Extends LRUCacheError to maintain error hierarchy
export class KeyNotFoundError extends LRUCacheError {
	constructor(key: unknown) {
		// Handle different key types appropriately:
		// - For objects: Convert to JSON string for readability
		// - For primitives: Convert to string directly
		super(`Key not found: ${typeof key === "object" ? JSON.stringify(key) : String(key)}`);
		this.name = "KeyNotFoundError"; // Set specific error name
	}
}
