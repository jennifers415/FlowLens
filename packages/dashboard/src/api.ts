const BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5055';

export type EventRow = {
    siteId: string; path: string; ts: number; type: string;
    x: number; y: number; w: number; h: number; tag?: string;
};

export async function fetchEvents(params: { siteId: string; from?: number; to?: number; path?: string }) {
    const url = new URL(BASE + '/api/events');
    Object.entries({ ...params }).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)));
    const r = await fetch(url);
    const j = await r.json();
    return j.events as EventRow[];
}

export async function fetchTagStats(params: { siteId: string; from?: number; to?: number }) {
    const url = new URL(BASE + '/api/stats/tags');
    Object.entries({ ...params }).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)));
    const r = await fetch(url);
    const j = await r.json();
    return j.tags as { tag: string; count: number }[];
}

export type TagBucketRow = { tag: string | null; bucket: number; count: number };

export async function fetchTagSeries(params: { siteId: string; from?: number; to?: number; bucketMs?: number }) {
    const url = new URL(BASE + '/api/stats/tags/series');
    Object.entries({ ...params }).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)));
    const r = await fetch(url);
    const j = await r.json();
    return { rows: j.buckets as TagBucketRow[], bucketMs: j.bucketMs as number };
}
