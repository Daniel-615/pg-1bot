import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";

const CACHE_KEY = "1bot-query-cache-v1";
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24;
const OFFLINE_KEYS = new Set([
  "extensions",
  "extensionBlocks",
  "extensionBlocks",
  "extensionStatuses",
  "blocks",
  "blockTypes",
  "blockStatuses",
  "dataTypes",
  "parameters",
  "parameterOptions",
  "plates",
  "categories",
  "extensionCategories",
  "blockShapes",
  "connectionTypes",
  "blockConnections",
  "blockPlates",
]);

function isOfflineCacheKey(queryKey: readonly unknown[]) {
  return typeof queryKey[0] === "string" && OFFLINE_KEYS.has(queryKey[0]);
}

function restoreQueryCache(client: QueryClient) {
  if (typeof window === "undefined") return;

  try {
    const rawCache = window.localStorage.getItem(CACHE_KEY);
    if (!rawCache) return;

    const cached = JSON.parse(rawCache) as { timestamp?: number; state?: unknown };
    if (!cached.timestamp || Date.now() - cached.timestamp > CACHE_MAX_AGE || !cached.state) {
      window.localStorage.removeItem(CACHE_KEY);
      return;
    }

    hydrate(client, cached.state);
  } catch {
    window.localStorage.removeItem(CACHE_KEY);
  }
}

function persistQueryCache(client: QueryClient) {
  if (typeof window === "undefined") return;

  try {
    const state = dehydrate(client, {
      shouldDehydrateQuery: (query) => isOfflineCacheKey(query.queryKey),
    });
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), state }));
  } catch {
    // A full or unavailable localStorage must not stop the editor.
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "offlineFirst",
      retry: 1,
      refetchOnReconnect: true,
    },
    mutations: {
      networkMode: "online",
      retry: 1,
    },
  },
});

restoreQueryCache(queryClient);
queryClient.getQueryCache().subscribe(() => persistQueryCache(queryClient));
