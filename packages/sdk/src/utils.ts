export function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
    let last = 0;
    let timeout: any;
    return function (this: any, ...args: any[]) {
        const now = Date.now();
        const remaining = ms - (now - last);
        if (remaining <= 0) {
            clearTimeout(timeout);
            last = now;
            fn.apply(this, args);
        } else if (!timeout) {
            timeout = setTimeout(() => {
                last = Date.now();
                timeout = null;
                fn.apply(this, args);
            }, remaining);
        }
    } as T;
}