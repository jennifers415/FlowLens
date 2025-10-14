import { insertMany } from '../db';

const now = Date.now();
const events = Array.from({ length: 200 }).map((_, i) => ({
    siteId: 'demo',
    path: '/demo',
    ts: now - Math.floor(Math.random() * 3600000),
    type: 'click' as const,
    x: Math.floor(Math.random() * 1200),
    y: Math.floor(Math.random() * 800),
    w: 1200,
    h: 800,
    tag: ['button', 'div', 'a', 'input'][i % 4]
}));

insertMany(events);
console.log('Seeded demo events');