import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.join(os.tmpdir(), `flowlens-test-${Date.now()}.db`);
process.env.DATABASE_PATH = dbPath;
process.env.CORS_ORIGIN = '*';

const appPromise = (async () => {
    const mod = await import('../app');
    return mod.createApp();
})();

describe('routes', () => {
    afterAll(() => {
        try {
            fs.rmSync(dbPath, { force: true });
        } catch {
            // ignore cleanup errors
        }
    });

    it('ingests and queries events', async () => {
        const app = await appPromise;
        const event = {
            siteId: 'demo',
            path: '/pricing',
            ts: Date.now(),
            type: 'click',
            x: 10,
            y: 20,
            w: 1200,
            h: 800,
            tag: 'button',
        };

        await request(app).post('/api/events').send({ events: [event] }).expect(200);
        const res = await request(app).get('/api/events').query({ siteId: 'demo', from: 0, to: Date.now() });

        expect(res.body.events.length).toBeGreaterThan(0);
    });

    it('returns tag series buckets', async () => {
        const app = await appPromise;
        const res = await request(app)
            .get('/api/stats/tags/series')
            .query({ siteId: 'demo', from: 0, to: Date.now(), bucketMs: 60_000 });

        expect(res.body.bucketMs).toBe(60_000);
        expect(Array.isArray(res.body.buckets)).toBe(true);
    });
});
