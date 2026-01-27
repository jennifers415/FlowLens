export default function Controls({
    siteId, setSiteId, path, setPath, from, setFrom, to, setTo, bucketMs, setBucketMs, refresh, loading
}: {
    siteId: string; setSiteId: (v: string) => void;
    path: string; setPath: (v: string) => void;
    from: number; setFrom: (n: number) => void;
    to: number; setTo: (n: number) => void;
    bucketMs: number; setBucketMs: (n: number) => void;
    refresh: () => void;
    loading: boolean;
}) {
    const presets = [
        { label: '15m', ms: 15 * 60_000 },
        { label: '1h', ms: 60 * 60_000 },
        { label: '6h', ms: 6 * 60 * 60_000 },
        { label: '24h', ms: 24 * 60 * 60_000 },
    ];

    const applyPreset = (ms: number) => {
        const nextTo = Date.now();
        setTo(nextTo);
        setFrom(nextTo - ms);
    };

    const fmt = (n: number) => new Date(n).toLocaleString();

    return (
        <section className="bg-white border rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap items-end gap-3">
                <div>
                    <label className="block text-xs text-slate-500">Site ID</label>
                    <input value={siteId} onChange={e => setSiteId(e.target.value)} className="px-3 py-2 rounded-lg border" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500">Path contains</label>
                    <input
                        value={path}
                        onChange={e => setPath(e.target.value)}
                        placeholder="/pricing"
                        className="px-3 py-2 rounded-lg border w-56"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-500">From (ms epoch)</label>
                    <input value={from} onChange={e => setFrom(Number(e.target.value || 0))} className="px-3 py-2 rounded-lg border w-56" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500">To (ms epoch)</label>
                    <input value={to} onChange={e => setTo(Number(e.target.value || 0))} className="px-3 py-2 rounded-lg border w-56" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500">Bucket</label>
                    <select
                        value={bucketMs}
                        onChange={e => setBucketMs(Number(e.target.value))}
                        className="px-3 py-2 rounded-lg border"
                    >
                        <option value={15_000}>15s</option>
                        <option value={60_000}>1m</option>
                        <option value={300_000}>5m</option>
                        <option value={900_000}>15m</option>
                    </select>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-60"
                    >
                        {loading ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <div className="text-slate-500">Quick ranges:</div>
                {presets.map(p => (
                    <button
                        key={p.label}
                        onClick={() => applyPreset(p.ms)}
                        className="px-3 py-1.5 rounded-full border bg-slate-50 hover:bg-slate-100"
                    >
                        {p.label}
                    </button>
                ))}
                <div className="ml-auto text-right text-xs text-slate-500">
                    <div>{fmt(from)} → {fmt(to)}</div>
                    <div className="text-[11px] text-slate-400">Path filter applies to heatmap events.</div>
                </div>
            </div>
        </section>
    );
}
