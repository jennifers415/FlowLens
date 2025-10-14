export type EventType = 'click' | 'hover' | 'keydown' | 'scroll';

export interface TrackedEvent {
    siteId: string;
    path: string;
    ts: number;
    type: EventType;
    x: number;
    y: number;
    w: number;
    h: number;
    tag?: string;
}