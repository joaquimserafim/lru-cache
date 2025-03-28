import { performance } from "perf_hooks";
import { LRUCache } from "./lru-cache";

type BenchmarkResult = {
	operation: string;
	size: number;
	time: number;
};

const formatNumber = (num: number): string => num.toLocaleString("en-US");

const formatResults = (results: BenchmarkResult[]): void => {
	console.table(
		results.map(({ operation, size, time }) => ({
			Operation: operation,
			Size: formatNumber(size),
			"Time (ms)": time.toFixed(2)
		}))
	);
};

const runOperation = (
	cache: LRUCache<string, number>,
	operation: "put" | "get" | "mixed" | "eviction",
	size: number
): number => {
	const start = performance.now();

	switch (operation) {
		case "put":
			for (let i = 0; i < size; i++) {
				cache.put(`key${i}`, i);
			}
			break;
		case "get":
			for (let i = 0; i < size; i++) {
				cache.get(`key${i}`);
			}
			break;
		case "mixed":
			for (let i = 0; i < size; i++) {
				try {
					cache.get(`key${i + size / 2}`);
				} catch {
					// Ignore KeyNotFoundError
				}
			}
			break;
		case "eviction":
			for (let i = 0; i < size; i++) {
				cache.put(`newkey${i}`, i);
			}
			break;
	}

	return performance.now() - start;
};

const benchmarkCache = () => {
	const sizes = [100, 1000, 10000];
	const results: BenchmarkResult[] = [];

	for (const size of sizes) {
		const cache = new LRUCache<string, number>(size);

		// Initial put operations
		results.push({
			operation: "Put",
			size,
			time: runOperation(cache, "put", size)
		});

		// Get operations (cache hits)
		results.push({
			operation: "Get",
			size,
			time: runOperation(cache, "get", size)
		});

		// Mixed operations (hits and misses)
		results.push({
			operation: "Mixed Get",
			size,
			time: runOperation(cache, "mixed", size)
		});

		// Eviction operations
		results.push({
			operation: "Eviction",
			size,
			time: runOperation(cache, "eviction", size)
		});
	}

	return results;
};

const main = () => {
	console.log("LRU Cache Performance Benchmark\n");
	console.log("Testing different operations and sizes...\n");

	const results = benchmarkCache();
	formatResults(results);
};

main();
