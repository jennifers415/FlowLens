import React from 'react';

export default function StatCards({
    total, byTag
}: { total: number; byTag: { tag: string; count: number }[] }) {
    return (
        <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border">
                <div className="text-slate-500 text-sm">Total Events</div>
                <div className="text-3xl font-semibold">{total.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-xl bg-white border md:col-span-2">
                <div className="text-slate-500 text-sm mb-2">Top Tags</div>
                <div className="flex flex-wrap gap-2">
                    {byTag.slice(0, 10).map(t => (
                        <span key={t.tag} className="px-3 py-1 rounded-full bg-slate-100 border text-sm">
                            {t.tag || 'unknown'} · {t.count}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}