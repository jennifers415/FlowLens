import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchEvents, fetchTagStats } from './api';
import HeatmapCanvas from './components/HeatmapCanvas';
import Controls from './components/Controls';
import StatCards from './components/StatCards';

export default function App() {
    const [siteId, setSiteId] = useState('demo');
    const [from, setFrom] = useState(() => Date.now() - 3600_000); // last 1h
    const [to, setTo] = useState(() => Date.now());
    const [events, setEvents] = useState<any[]>([]);
    const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setErr(null);
        try {
            const [ev, tg] = await Promise.all([
                fetchEvents({ siteId, from, to }),
                fetchTagStats({ siteId, from, to }),
            ]);
            setEvents(ev);
            setTags(tg);
            console.log('Refreshed', { siteId, from, to, evCount: ev.length });
        } catch (e: any) {
            console.error('Refresh failed', e);
            setErr(e?.message || 'Failed to fetch');
        } finally {
            setLoading(false);
        }
    }, [siteId, from, to]);

    useEffect(() => { refresh(); }, [refresh]);

    useEffect(() => {
        const id = setInterval(() => setTo(Date.now()), 5000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            <Controls siteId={siteId} setSiteId={setSiteId} from={from} setFrom={setFrom} to={to} setTo={setTo} refresh={refresh} />
            <StatCards total={events.length} byTag={tags} />

            <div className="space-y-2">
                <div className="text-slate-600">Heatmap</div>
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