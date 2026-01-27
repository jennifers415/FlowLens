import React, { useCallback, useEffect, useState } from 'react';
import { fetchEvents, fetchTagStats, fetchTagSeries, TagBucketRow } from './api';
import HeatmapCanvas from './components/HeatmapCanvas';
import Controls from './components/Controls';
import StatCards from './components/StatCards';
import TagSeries from './components/TagSeries';

export default function App() {
    const [siteId, setSiteId] = useState('demo');
    const [path, setPath] = useState('');
    const [from, setFrom] = useState(() => Date.now() - 3600_000); // last 1h
    const [to, setTo] = useState(() => Date.now());
    const [events, setEvents] = useState<any[]>([]);
    const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
    const [tagSeries, setTagSeries] = useState<TagBucketRow[]>([]);
    const [bucketMs, setBucketMs] = useState(60_000);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setErr(null);
        try {
            const [ev, tg, series] = await Promise.all([
                fetchEvents({ siteId, from, to, path }),
                fetchTagStats({ siteId, from, to }),
                fetchTagSeries({ siteId, from, to, bucketMs }),
            ]);
            setEvents(ev);
            setTags(tg);
            setTagSeries(series.rows);
        } catch (e: any) {
            console.error('Refresh failed', e);
            setErr(e?.message || 'Failed to fetch');
        } finally {
            setLoading(false);
        }
    }, [siteId, path, from, to, bucketMs]);

    useEffect(() => { refresh(); }, [refresh]);

    useEffect(() => {
        const id = setInterval(() => setTo(Date.now()), 5000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <header className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">FlowLens Dashboard</h1>
                <p className="text-slate-600 max-w-3xl">
                    Filter by site and time window, interact with the demo pages, then refresh to see heatmaps and
                    component activity update.
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                    <a className="px-3 py-1.5 rounded-full border bg-white hover:bg-slate-50" href="/demo.html">Open Demo 1</a>
                    <a className="px-3 py-1.5 rounded-full border bg-white hover:bg-slate-50" href="/demo2.html">Open Demo 2</a>
                </div>
            </header>

            <Controls
                siteId={siteId}
                setSiteId={setSiteId}
                path={path}
                setPath={setPath}
                from={from}
                setFrom={setFrom}
                to={to}
                setTo={setTo}
                bucketMs={bucketMs}
                setBucketMs={setBucketMs}
                refresh={refresh}
                loading={loading}
            />

            {err && (
                <div className="px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                    {err}
                </div>
            )}

            <StatCards total={events.length} byTag={tags} from={from} to={to} />
            <TagSeries rows={tagSeries} from={from} to={to} bucketMs={bucketMs} />

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="text-slate-700 font-medium">Heatmap</div>
                    <div className="text-xs text-slate-500">{events.length.toLocaleString()} events in view</div>
                </div>
                <div className="text-sm text-slate-500">
                    Heatmap intensity reflects event density across the current time window.
                </div>
                <HeatmapCanvas events={events} />
            </div>

            <section className="bg-white border rounded-xl p-4">
                <h2 className="font-semibold mb-2">Embedding SDK to additional HTML pages:</h2>
                <pre className="text-sm bg-slate-50 p-3 rounded-lg overflow-auto"><code>{`<script src="/path/to/flowlens-sdk.umd.js"></script>
<script>
FlowLensSDK.init({
siteId: '{siteid}',
serverUrl: '${import.meta.env.VITE_SERVER_URL || 'http://localhost:5055'}'
});
</script>`}</code></pre>
            </section>
        </div>
    );
}
