import React, { useEffect, useRef } from 'react';
import { drawHeatmap, toHeatmapPoints } from '../lib/heatmap';
import type { EventRow } from '../api';

export default function HeatmapCanvas({ events }: { events: EventRow[] }) {
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = ref.current!;
        const dpr = window.devicePixelRatio || 1;
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        const ctx = canvas.getContext('2d')!;
        ctx.scale(dpr, dpr);

        const pts = toHeatmapPoints(events, canvas);
        drawHeatmap(ctx, pts);
    }, [events]);

    return (
        <div className="relative w-full h-[600px] rounded-xl border bg-white overflow-hidden">
            <iframe
                title="preview"
                srcDoc="<!doctype html><html><body style='margin:0'><div style='height:600px;display:flex;align-items:center;justify-content:center;font-family:sans-serif'>Preview Target Area</div></body></html>"
                className="absolute inset-0 w-full h-full"
            />
            <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>
    );
}