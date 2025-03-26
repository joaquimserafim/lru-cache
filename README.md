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
// - TTL (Time To Live) of 60000 milliseconds (60 seconds)
const cache = new LRUCache<string, number>(1000, 60000);

// Set a value in the cache
cache.set("key", 123);
```
