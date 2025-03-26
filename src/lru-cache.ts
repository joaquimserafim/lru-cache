import { InvalidCapacityError, KeyNotFoundError, LRUCacheError } from "@/errors";

//
// LRUCache Node class
// Represents a node in the doubly-linked list
//

class LRUNode<K, V> {
	key: K;
	value: V;
	prev: LRUNode<K, V> | null = null; // Reference to previous node
	next: LRUNode<K, V> | null = null; // Reference to next node

	constructor(key: K, value: V) {
		this.key = key;
		this.value = value;
	}
}

//
// LRUCache class
// Implements a Least Recently Used (LRU) cache
// Uses a doubly-linked list to maintain order of items
// Uses a hash map for O(1) key lookups
//

export class LRUCache<K, V> {
	private capacity: number; // Maximum number of items the cache can hold
	private cache: Map<K, LRUNode<K, V>>; // Hash map for O(1) key lookups
	private head: LRUNode<K, V>; // Dummy head node for the doubly-linked list
	private tail: LRUNode<K, V>; // Dummy tail node for the doubly-linked list

	constructor(capacity: number) {
		// Validate that capacity is a positive integer
		if (!Number.isInteger(capacity) || capacity <= 0) {
			throw new InvalidCapacityError(capacity);
		}

		this.capacity = capacity;
		this.cache = new Map();

		// Initialize dummy nodes to simplify list operations
		// Using null as values since these are sentinel nodes
		this.head = new LRUNode<K, V>(null as K, null as V);
		this.tail = new LRUNode<K, V>(null as K, null as V);
		this.head.next = this.tail; // Head -> Tail (empty list)
		this.tail.prev = this.head; // Head <- Tail
	}

	get(key: K): V {
		// Try to find the node in our cache
		const node = this.cache.get(key);
		if (!node) {
			throw new KeyNotFoundError(key);
		}

		try {
			// Move to front since this is now the most recently used item
			this.removeNode(node); // Remove from current position
			this.addToFront(node); // Add to front (most recently used)
			return node.value;
		} catch (error) {
			// Wrap any internal errors in our custom error type
			throw new LRUCacheError(
				`Error accessing key ${String(key)}: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	// Safe version of get that returns undefined instead of throwing
	getSafe(key: K): V | undefined {
		try {
			return this.get(key);
		} catch (error) {
			if (error instanceof KeyNotFoundError) {
				return undefined;
			}
			throw error;
		}
	}

	put(key: K, value: V): void {
		if (key === null || key === undefined) {
			throw new LRUCacheError("Key cannot be null or undefined");
		}

		try {
			const existingNode = this.cache.get(key);

			if (existingNode) {
				// Update existing node
				existingNode.value = value;
				this.removeNode(existingNode);
				this.addToFront(existingNode);
			} else {
				// Create new node
				const newNode = new LRUNode(key, value);

				// If we're at capacity, remove least recently used item (from tail)
				if (this.cache.size >= this.capacity) {
					const lru = this.tail.prev!; // Get LRU item (just before tail)
					this.removeNode(lru); // Remove from list
					this.cache.delete(lru.key); // Remove from cache
				}

				this.cache.set(key, newNode); // Add to cache
				this.addToFront(newNode); // Add to front of list
			}
		} catch (error) {
			throw new LRUCacheError(
				`Error putting key ${String(key)}: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	// Helper method to remove a node from the doubly-linked list
	private removeNode(node: LRUNode<K, V>): void {
		if (!node.prev || !node.next) {
			throw new LRUCacheError("Invalid node state: missing links");
		}

		// Update the links to skip over this node
		const prev = node.prev;
		const next = node.next;
		prev.next = next;
		next.prev = prev;
	}

	// Helper method to add a node to the front of the list (most recently used)
	private addToFront(node: LRUNode<K, V>): void {
		if (!this.head.next) {
			throw new LRUCacheError("Invalid cache state: missing head link");
		}

		// Insert node between head and head.next
		node.prev = this.head;
		node.next = this.head.next;
		this.head.next.prev = node;
		this.head.next = node;
	}

	// Additional helper methods with error handling
	size(): number {
		return this.cache.size;
	}

	clear(): void {
		try {
			this.cache.clear(); // Clear the hash map
			// Reset the doubly-linked list to empty state
			this.head.next = this.tail;
			this.tail.prev = this.head;
		} catch (error) {
			throw new LRUCacheError(
				`Error clearing cache: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	// Returns keys in order from most recently used to least recently used
	keys(): K[] {
		const keys: K[] = []; // Will store the keys in order
		try {
			let current = this.head.next;
			// Traverse the list from head to tail
			while (current !== this.tail) {
				if (!current) {
					throw new LRUCacheError("Invalid cache state: broken link in chain");
				}
				keys.push(current.key);
				current = current.next;
			}
			return keys;
		} catch (error) {
			throw new LRUCacheError(
				`Error getting keys: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	// Check if a key exists in the cache
	has(key: K): boolean {
		return this.cache.has(key);
	}
}
