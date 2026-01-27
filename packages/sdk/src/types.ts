export type EventType = 'click' | 'hover' | 'keydown' | 'scroll';

export interface TrackedEvent {
    siteId: string;
    path: string; // location.pathname
    ts: number; // epoch ms
    type: EventType;
    x: number; // clientX
    y: number; // clientY
    w: number; // viewport width
    h: number; // viewport height
    tag?: string; // target tagName
}

export interface SDKOptions {
    siteId: string;
    serverUrl: string; // e.g., http://localhost:5055
    batchIntervalMs?: number; // default 2000
    maxBatchSize?: number; // default 100
    maxBufferSize?: number; // default 5000
}
