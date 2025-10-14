import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Database from 'better-sqlite3';

const DB_PATH = process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data/flowlens.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

const schema = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

export const insertEvent = db.prepare(
    `INSERT INTO events (site_id, path, ts, type, x, y, w, h, tag)
   VALUES (@siteId, @path, @ts, @type, @x, @y, @w, @h, @tag)`
);

export const insertMany = db.transaction((rows: any[]) => {
    for (const r of rows) insertEvent.run(r);
});

export const queryEvents = db.prepare(
    `SELECT site_id as siteId, path, ts, type, x, y, w, h, tag
   FROM events
   WHERE site_id = ? AND ts BETWEEN ? AND ? AND path LIKE ?`
);

export const statsByTag = db.prepare(
    `SELECT tag, COUNT(*) as count
   FROM events
   WHERE site_id = ? AND ts BETWEEN ? AND ?
   GROUP BY tag
   ORDER BY count DESC`
);
