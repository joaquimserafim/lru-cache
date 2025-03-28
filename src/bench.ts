import { performance } from "perf_hooks";
import { LRUCache } from "./lru-cache";

const formatNumber = (num: number): string => num.toLocaleString("en-US");

const runBenchmark = () => {
	console.log("Running LRU Cache Benchmarks...\n");

	// Test different cache sizes
	const sizes = [100, 1000, 10000];

	for (const size of sizes) {
		console.log(`\nTesting cache with capacity: ${formatNumber(size)}`);
		const cache = new LRUCache<string, number>(size);

		// Benchmark put operations (filling cache)
		const putStart = performance.now();
		for (let i = 0; i < size; i++) {
			cache.put(`key${i}`, i);
		}
		const putEnd = performance.now();
		console.log(`Put ${formatNumber(size)} items: ${(putEnd - putStart).toFixed(2)}ms`);

		// Benchmark get operations (hitting cache)
		const getStart = performance.now();
		for (let i = 0; i < size; i++) {
			cache.get(`key${i}`);
		}
		const getEnd = performance.now();
		console.log(`Get ${formatNumber(size)} items: ${(getEnd - getStart).toFixed(2)}ms`);

		// Benchmark get operations (with cache hits and misses)
		const mixedStart = performance.now();
		for (let i = 0; i < size; i++) {
			try {
				cache.get(`key${i + size / 2}`); // Half hits, half misses
			} catch {
				// Ignore KeyNotFoundError
			}
		}
		const mixedEnd = performance.now();
		console.log(
			`Mixed gets ${formatNumber(size)} items: ${(mixedEnd - mixedStart).toFixed(2)}ms`
		);

		// Benchmark update operations (replacing existing items)
		const updateStart = performance.now();
		for (let i = 0; i < size; i++) {
			cache.put(`key${i}`, i + 1);
		}
		const updateEnd = performance.now();
		console.log(
			`Update ${formatNumber(size)} items: ${(updateEnd - updateStart).toFixed(2)}ms`
		);

		// Benchmark eviction (adding items beyond capacity)
		const evictionStart = performance.now();
		for (let i = 0; i < size; i++) {
			cache.put(`newkey${i}`, i);
		}
		const evictionEnd = performance.now();
		console.log(
			`Eviction test ${formatNumber(size)} items: ${(evictionEnd - evictionStart).toFixed(2)}ms`
		);
	}
};

// Run the benchmark
console.log("LRU Cache Performance Benchmark\n");
runBenchmark();
