import React from 'react';

export default function StatCards({
    total, byTag, from, to
}: { total: number; byTag: { tag: string; count: number }[]; from: number; to: number }) {
    const rangeLabel = `${new Date(from).toLocaleString()} -> ${new Date(to).toLocaleString()}`;
    return (
        <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border">
                <div className="text-slate-500 text-sm">Total Events (window)</div>
                <div className="text-3xl font-semibold">{total.toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-1">{rangeLabel}</div>
            </div>
            <div className="p-4 rounded-xl bg-white border md:col-span-2">
                <div className="text-slate-500 text-sm mb-2">Top Components (by tag)</div>
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
