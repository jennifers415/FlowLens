import { performance } from 'node:perf_hooks';

type Args = {
    events: number;
    batch: number;
    siteId: string;
    path: string;
    serverUrl: string;
};

function parseArgs(): Args {
    const args = new Map<string, string>();
    for (let i = 2; i < process.argv.length; i += 1) {
        const raw = process.argv[i];
        if (!raw.startsWith('--')) continue;
        const key = raw.slice(2);
        const val = process.argv[i + 1]?.startsWith('--') ? 'true' : process.argv[i + 1];
        if (val && val !== 'true') i += 1;
        args.set(key, val ?? 'true');
    }
    const num = (k: string, d: number) => {
        const v = Number(args.get(k));
        return Number.isFinite(v) && v > 0 ? Math.floor(v) : d;
    };
    return {
        events: num('events', 50_000),
        batch: num('batch', 100),
        siteId: args.get('siteId') || 'bench',
        path: args.get('path') || '/bench',
        serverUrl: args.get('serverUrl') || process.env.SERVER_URL || 'http://localhost:5055',
    };
}

function percentile(sorted: number[], p: number) {
    if (sorted.length === 0) return 0;
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * sorted.length)));
    return sorted[idx];
}

async function main() {
    const cfg = parseArgs();
    const batches = Math.ceil(cfg.events / cfg.batch);
    const latencies: number[] = [];
    let sent = 0;

    const start = performance.now();
    for (let b = 0; b < batches; b += 1) {
        const remaining = cfg.events - sent;
        const size = Math.min(cfg.batch, remaining);
        const now = Date.now();
        const events = Array.from({ length: size }, (_, i) => {
            const jitter = i % 7;
            return {
                siteId: cfg.siteId,
                path: cfg.path,
                ts: now + jitter,
                type: 'click' as const,
                x: (i * 13) % 1200,
                y: (i * 17) % 800,
                w: 1200,
                h: 800,
                tag: i % 3 === 0 ? 'button' : i % 3 === 1 ? 'a' : 'div',
            };
        });

        const t0 = performance.now();
        const res = await fetch(`${cfg.serverUrl}/api/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events }),
        });
        const t1 = performance.now();
        latencies.push(t1 - t0);

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Ingest failed: ${res.status} ${text}`);
        }

        sent += size;
        if ((b + 1) % 25 === 0 || sent === cfg.events) {
            // Lightweight progress signal for long runs.
            console.log(`sent ${sent}/${cfg.events}`);
        }
    }
    const end = performance.now();

    const totalMs = end - start;
    const perBatch = sent / batches;
    const perSec = (sent / totalMs) * 1000;
    const perMin = perSec * 60;

    latencies.sort((a, b) => a - b);
    const p50 = percentile(latencies, 0.5);
    const p95 = percentile(latencies, 0.95);

    console.log('\nFlowLens ingest benchmark');
    console.log(`server: ${cfg.serverUrl}`);
    console.log(`events: ${sent}`);
    console.log(`batches: ${batches}`);
    console.log(`avg batch size: ${perBatch.toFixed(1)}`);
    console.log(`throughput: ${perSec.toFixed(1)} events/sec (${Math.round(perMin)} events/min)`);
    console.log(`latency p50: ${p50.toFixed(1)}ms`);
    console.log(`latency p95: ${p95.toFixed(1)}ms`);
    console.log(`total time: ${(totalMs / 1000).toFixed(2)}s`);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
