import { describe, it, expect, vi } from 'vitest';
import { throttle } from '../utils';

describe('throttle', () => {
    it('fires immediately and then at most once per window', () => {
        vi.useFakeTimers();
        const fn = vi.fn();
        const throttled = throttle(fn, 100);

        throttled();
        throttled();
        throttled();

        expect(fn).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(2);

        vi.useRealTimers();
    });
});
