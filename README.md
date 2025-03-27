# LRU Cache

A TypeScript implementation of a cache with LRU (Least Recently Used) eviction strategies. When the cache reaches its capacity, it removes the least recently accessed items first

## Installation

```bash
pnpm add @joaquimserafim/lru-cache
```

## Usage

```typescript
import { LRUCache } from "@joaquimserafim/lru-cache";

// Create a new cache instance with:
// - maximum size of 1000 items
const cache = new LRUCache<string, number>(1000);

// Set values in the cache
cache.put("key", 123);

// Get a value (throws if key doesn't exist)
const value = cache.get("key"); // returns 123

// Get a value safely (returns undefined if key doesn't exist)
const safeValue = cache.getSafe("key"); // returns 123

// Check if key exists
const exists = cache.has("key"); // returns true

// Get all keys in order of most recently used
const keys = cache.keys(); // returns ["key"]

// Get current cache size
const size = cache.size(); // returns 1

// Clear the cache
cache.clear();
```
