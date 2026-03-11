export type DemoEventRow = {
  siteId: string;
  path: string;
  ts: number;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tag?: string;
};

const now = Date.now();

export const demoEvents: DemoEventRow[] = [
  { siteId: "demo", path: "/demo.html", ts: now - 50 * 60_000, type: "click", x: 180, y: 120, w: 1440, h: 900, tag: "button" },
  { siteId: "demo", path: "/demo.html", ts: now - 48 * 60_000, type: "click", x: 220, y: 150, w: 1440, h: 900, tag: "button" },
  { siteId: "demo", path: "/demo.html", ts: now - 46 * 60_000, type: "hover", x: 250, y: 180, w: 1440, h: 900, tag: "button" },
  { siteId: "demo", path: "/demo.html", ts: now - 43 * 60_000, type: "click", x: 520, y: 260, w: 1440, h: 900, tag: "input" },
  { siteId: "demo", path: "/demo.html", ts: now - 41 * 60_000, type: "click", x: 540, y: 280, w: 1440, h: 900, tag: "input" },
  { siteId: "demo", path: "/demo.html", ts: now - 38 * 60_000, type: "scroll", x: 700, y: 400, w: 1440, h: 900, tag: "section" },
  { siteId: "demo", path: "/demo.html", ts: now - 35 * 60_000, type: "click", x: 860, y: 330, w: 1440, h: 900, tag: "a" },
  { siteId: "demo", path: "/demo.html", ts: now - 32 * 60_000, type: "click", x: 900, y: 340, w: 1440, h: 900, tag: "a" },
  { siteId: "demo", path: "/demo.html", ts: now - 29 * 60_000, type: "hover", x: 930, y: 360, w: 1440, h: 900, tag: "card" },
  { siteId: "demo", path: "/demo.html", ts: now - 26 * 60_000, type: "click", x: 420, y: 520, w: 1440, h: 900, tag: "button" },
  { siteId: "demo", path: "/demo.html", ts: now - 22 * 60_000, type: "click", x: 440, y: 540, w: 1440, h: 900, tag: "button" },
  { siteId: "demo", path: "/demo.html", ts: now - 18 * 60_000, type: "hover", x: 460, y: 560, w: 1440, h: 900, tag: "button" },

  { siteId: "demo2", path: "/demo2.html", ts: now - 55 * 60_000, type: "click", x: 210, y: 180, w: 1440, h: 900, tag: "button" },
  { siteId: "demo2", path: "/demo2.html", ts: now - 52 * 60_000, type: "click", x: 260, y: 220, w: 1440, h: 900, tag: "select" },
  { siteId: "demo2", path: "/demo2.html", ts: now - 49 * 60_000, type: "hover", x: 300, y: 250, w: 1440, h: 900, tag: "textarea" },
  { siteId: "demo2", path: "/demo2.html", ts: now - 45 * 60_000, type: "click", x: 760, y: 210, w: 1440, h: 900, tag: "button" },
  { siteId: "demo2", path: "/demo2.html", ts: now - 42 * 60_000, type: "click", x: 790, y: 250, w: 1440, h: 900, tag: "button" },
  { siteId: "demo2", path: "/demo2.html", ts: now - 39 * 60_000, type: "scroll", x: 820, y: 500, w: 1440, h: 900, tag: "table" },
  { siteId: "demo2", path: "/demo2.html", ts: now - 34 * 60_000, type: "click", x: 620, y: 610, w: 1440, h: 900, tag: "button" },
  { siteId: "demo2", path: "/demo2.html", ts: now - 30 * 60_000, type: "hover", x: 640, y: 630, w: 1440, h: 900, tag: "card" },
  { siteId: "demo2", path: "/demo2.html", ts: now - 24 * 60_000, type: "click", x: 350, y: 700, w: 1440, h: 900, tag: "input" },
  { siteId: "demo2", path: "/demo2.html", ts: now - 20 * 60_000, type: "click", x: 380, y: 720, w: 1440, h: 900, tag: "input" },
  { siteId: "demo2", path: "/demo2.html", ts: now - 16 * 60_000, type: "hover", x: 410, y: 740, w: 1440, h: 900, tag: "textarea" },
  { siteId: "demo2", path: "/demo2.html", ts: now - 12 * 60_000, type: "click", x: 990, y: 300, w: 1440, h: 900, tag: "button" },
];

export function filterDemoEvents(params: {
  siteId: string;
  from?: number;
  to?: number;
  path?: string;
}) {
  return demoEvents.filter((e) => {
    if (params.siteId && e.siteId !== params.siteId) return false;
    if (params.from != null && e.ts < params.from) return false;
    if (params.to != null && e.ts > params.to) return false;
    if (params.path && !e.path.includes(params.path)) return false;
    return true;
  });
}

export function getDemoTagStats(params: {
  siteId: string;
  from?: number;
  to?: number;
}) {
  const events = filterDemoEvents(params);
  const counts = new Map<string, number>();

  for (const e of events) {
    const key = e.tag || "unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getDemoTagSeries(params: {
  siteId: string;
  from?: number;
  to?: number;
  bucketMs?: number;
}) {
  const bucketMs = params.bucketMs ?? 60_000;
  const events = filterDemoEvents(params);

  const rows: { tag: string | null; bucket: number; count: number }[] = [];
  const buckets = new Map<string, number>();

  for (const e of events) {
    const bucket = Math.floor(e.ts / bucketMs) * bucketMs;
    const key = `${e.tag || "unknown"}__${bucket}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  for (const [key, count] of buckets.entries()) {
    const split = key.split("__");
    const tag = split[0];
    const bucket = Number(split[1]);
    rows.push({ tag, bucket, count });
  }

  return { rows, bucketMs };
}