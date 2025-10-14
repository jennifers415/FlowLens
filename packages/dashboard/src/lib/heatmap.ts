import type { EventRow } from '../api';

export type HeatmapPoint = { x: number; y: number; v: number };

export function toHeatmapPoints(events: EventRow[], canvas: HTMLCanvasElement): HeatmapPoint[] {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width; const h = rect.height;
    return events.map(e => ({
        x: (e.x / e.w) * w,
        y: (e.y / e.h) * h,
        v: 1,
    }));
}

export function drawHeatmap(ctx: CanvasRenderingContext2D, points: HeatmapPoint[]) {
    const { canvas } = ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of points) {
        const radius = 30;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        grd.addColorStop(0, 'rgba(255,0,0,0.35)');
        grd.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}