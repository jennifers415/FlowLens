import React from 'react';

export default function Controls({
    siteId, setSiteId, from, setFrom, to, setTo, refresh
}: {
    siteId: string; setSiteId: (v: string) => void;
    from: number; setFrom: (n: number) => void;
    to: number; setTo: (n: number) => void;
    refresh: () => void;
}) {
    return (
        <div className="flex flex-wrap items-end gap-3">
            <div>
                <label className="block text-xs text-slate-500">Site ID</label>
                <input value={siteId} onChange={e => setSiteId(e.target.value)} className="px-3 py-2 rounded-lg border" />
            </div>
            <div>
                <label className="block text-xs text-slate-500">From (ms epoch)</label>
                <input value={from} onChange={e => setFrom(Number(e.target.value || 0))} className="px-3 py-2 rounded-lg border w-56" />
            </div>
            <div>
                <label className="block text-xs text-slate-500">To (ms epoch)</label>
                <input value={to} onChange={e => setTo(Number(e.target.value || 0))} className="px-3 py-2 rounded-lg border w-56" />
            </div>
        </div>
    );
}