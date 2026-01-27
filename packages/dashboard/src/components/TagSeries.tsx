import React, { useMemo } from 'react';
import type { TagBucketRow } from '../api';

type SeriesRow = { tag: string; total: number; values: number[] };

function buildSeries(rows: TagBucketRow[], from: number, to: number, bucketMs: number) {
    const start = Math.floor(from / bucketMs) * bucketMs;
    const end = Math.floor(to / bucketMs) * bucketMs;
    const buckets: number[] = [];
    for (let t = start; t <= end; t += bucketMs) buckets.push(t);

    const byTag = new Map<string, Map<number, number>>();
    const totals = new Map<string, number>();

    for (const r of rows) {
        const tag = r.tag || 'unknown';
        const bucket = r.bucket;
        const map = byTag.get(tag) || new Map<number, number>();
        map.set(bucket, (map.get(bucket) || 0) + r.count);
        byTag.set(tag, map);
        totals.set(tag, (totals.get(tag) || 0) + r.count);
    }

    const series: SeriesRow[] = Array.from(byTag.entries())
        .map(([tag, bucketMap]) => ({
            tag,
            total: totals.get(tag) || 0,
            values: buckets.map(b => bucketMap.get(b) || 0),
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 8);

    const max = series.reduce((acc, s) => Math.max(acc, ...s.values), 0);
    return { buckets, series, max };
}

export default function TagSeries({
    rows, from, to, bucketMs
}: { rows: TagBucketRow[]; from: number; to: number; bucketMs: number }) {
    const { buckets, series, max } = useMemo(
        () => buildSeries(rows, from, to, bucketMs),
        [rows, from, to, bucketMs]
    );

    const bucketLabel = bucketMs >= 60_000 ? `${bucketMs / 60_000}m` : `${Math.round(bucketMs / 1000)}s`;

    return (
        <section className="bg-white border rounded-xl p-4 space-y-3">
            <div className="flex items-baseline justify-between">
                <h2 className="font-semibold">Component Activity</h2>
                <div className="text-xs text-slate-500">bucket {bucketLabel} · {buckets.length} windows</div>
            </div>
            <div className="text-sm text-slate-500">
                Each row is a tag (for example, `button` or `a`) bucketed over time.
            </div>

            {series.length === 0 ? (
                <div className="text-sm text-slate-500">No events in this time range.</div>
            ) : (
                <div className="space-y-2">
                    {series.map(s => (
                        <div key={s.tag} className="flex items-center gap-3">
                            <div className="w-28 text-sm text-slate-600 truncate">{s.tag}</div>
                            <div className="flex-1 flex items-end gap-1 h-8">
                                {s.values.map((v, i) => {
                                    const height = max > 0 ? Math.round((v / max) * 100) : 0;
                                    const pct = Math.max(2, height);
                                    return (
                                        <div
                                            key={`${s.tag}-${i}`}
                                            title={`${v} events`}
                                            className="flex-1 rounded-sm bg-indigo-200"
                                            style={{ height: `${pct}%` }}
                                        />
                                    );
                                })}
                            </div>
                            <div className="w-10 text-xs text-slate-500 text-right">{s.total}</div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
