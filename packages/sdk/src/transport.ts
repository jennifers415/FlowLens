import type { TrackedEvent, SDKOptions } from './types';

export class Transport {
    private buf: TrackedEvent[] = [];
    private timer?: any;
    private opts: Required<Pick<SDKOptions, 'serverUrl' | 'batchIntervalMs' | 'maxBatchSize'>>;

    constructor(private siteId: string, options: SDKOptions) {
        this.opts = {
            serverUrl: options.serverUrl,
            batchIntervalMs: options.batchIntervalMs ?? 2000,
            maxBatchSize: options.maxBatchSize ?? 100,
        };
    }

    enqueue(e: Omit<TrackedEvent, 'siteId'>) {
        this.buf.push({ ...e, siteId: this.siteId });
        if (this.buf.length >= this.opts.maxBatchSize) this.flush();
        if (!this.timer) this.timer = setTimeout(() => this.flush(), this.opts.batchIntervalMs);
    }

    async flush() {
        if (!this.buf.length) return;
        const payload = this.buf.splice(0, this.buf.length);
        clearTimeout(this.timer);
        this.timer = undefined;
        try {
            await fetch(`${this.opts.serverUrl}/api/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: payload }),
                keepalive: true
            });
        } catch (e) {
            // requeue if fail
            this.buf.unshift(...payload);
        }
    }
}