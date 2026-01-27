import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Transport } from '../transport';

describe('Transport', () => {
    beforeEach(() => {
        (globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: true });
    });

    it('flushes when max batch size is reached', async () => {
        const transport = new Transport('demo', { siteId: 'demo', serverUrl: 'http://localhost', maxBatchSize: 2, batchIntervalMs: 10_000 });
        transport.enqueue({ path: '/', ts: 1, type: 'click', x: 1, y: 1, w: 100, h: 100, tag: 'a' });
        transport.enqueue({ path: '/', ts: 2, type: 'click', x: 2, y: 2, w: 100, h: 100, tag: 'b' });

        await Promise.resolve();
        expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
    });

    it('flushes on interval when below batch size', async () => {
        vi.useFakeTimers();
        const transport = new Transport('demo', { siteId: 'demo', serverUrl: 'http://localhost', maxBatchSize: 10, batchIntervalMs: 500 });
        transport.enqueue({ path: '/', ts: 1, type: 'click', x: 1, y: 1, w: 100, h: 100, tag: 'a' });

        vi.advanceTimersByTime(500);
        await Promise.resolve();
        expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
        vi.useRealTimers();
    });
});
