import type { TrackedEvent, SDKOptions } from './types';

export class Transport {
    private buf: TrackedEvent[] = [];
    private timer?: any;
    private failures = 0;
    private opts: Required<Pick<SDKOptions, 'serverUrl' | 'batchIntervalMs' | 'maxBatchSize' | 'maxBufferSize'>>;

    constructor(private siteId: string, options: SDKOptions) {
        this.opts = {
            serverUrl: options.serverUrl,
            batchIntervalMs: options.batchIntervalMs ?? 2000,
            maxBatchSize: options.maxBatchSize ?? 100,
            maxBufferSize: options.maxBufferSize ?? 5000,
        };
    }

    enqueue(e: Omit<TrackedEvent, 'siteId'>) {
        this.buf.push({ ...e, siteId: this.siteId });
        if (this.buf.length > this.opts.maxBufferSize) {
            const overflow = this.buf.length - this.opts.maxBufferSize;
            // Drop oldest events to avoid unbounded memory growth when offline.
            this.buf.splice(0, overflow);
        }
        if (this.buf.length >= this.opts.maxBatchSize) this.flush();
        if (!this.timer) this.timer = setTimeout(() => this.flush(), this.opts.batchIntervalMs);
    }

    async flush() {
        if (!this.buf.length) return;
        const payload = this.buf.splice(0, this.buf.length);
        clearTimeout(this.timer);
        this.timer = undefined;
        try {
            const res = await fetch(`${this.opts.serverUrl}/api/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: payload }),
                keepalive: true
            });
            if (!res.ok) {
                throw new Error(`Ingest failed: ${res.status}`);
            }
            this.failures = 0;
        } catch (e) {
            // requeue if fail
            this.buf.unshift(...payload);
            if (this.buf.length > this.opts.maxBufferSize) {
                this.buf.length = this.opts.maxBufferSize;
            }
            this.failures += 1;
            const backoff = Math.min(30_000, this.opts.batchIntervalMs * 2 ** Math.min(this.failures, 5));
            if (!this.timer) this.timer = setTimeout(() => this.flush(), backoff);
        }
    }
}
