import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { insertMany, queryEvents, statsByTag, statsByTagBucket } from './db';

const router = Router();

const EventSchema = z.object({
    siteId: z.string(),
    path: z.string(),
    ts: z.number(),
    type: z.enum(['click', 'hover', 'keydown', 'scroll']),
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
    tag: z.string().optional(),
});

router.post('/events', (req: Request, res: Response) => {
    const body = z.object({ events: z.array(EventSchema) }).safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: 'Invalid payload' });
    try {
        insertMany(body.data.events);
        res.json({ ok: true, ingested: body.data.events.length });
    } catch (err) {
        console.error('Insert failed', err);
        res.status(500).json({ error: 'Failed to ingest events' });
    }
});

router.get('/events', (req: Request, res: Response) => {
    const siteId = String(req.query.siteId || 'demo');
    const from = Number(req.query.from || Date.now() - 1000 * 60 * 60);
    const to = Number(req.query.to || Date.now());
    const pathLike = '%' + String(req.query.path || '') + '%';
    const rows = queryEvents.all(siteId, from, to, pathLike);
    res.json({ events: rows });
});

router.get('/stats/tags', (req: Request, res: Response) => {
    const siteId = String(req.query.siteId || 'demo');
    const from = Number(req.query.from || Date.now() - 1000 * 60 * 60);
    const to = Number(req.query.to || Date.now());
    const rows = statsByTag.all(siteId, from, to);
    res.json({ tags: rows });
});

router.get('/stats/tags/series', (req: Request, res: Response) => {
    const siteId = String(req.query.siteId || 'demo');
    const from = Number(req.query.from || Date.now() - 1000 * 60 * 60);
    const to = Number(req.query.to || Date.now());
    const bucketMsRaw = Number(req.query.bucketMs || 60_000);
    const bucketMs = Number.isFinite(bucketMsRaw) ? Math.max(1000, Math.floor(bucketMsRaw)) : 60_000;
    const rows = statsByTagBucket.all(bucketMs, bucketMs, siteId, from, to);
    res.json({ buckets: rows, bucketMs });
});

export default router;
