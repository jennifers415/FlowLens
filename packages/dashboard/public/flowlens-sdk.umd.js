(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

    class Transport {
        constructor(siteId, options) {
            this.siteId = siteId;
            this.buf = [];
            this.opts = {
                serverUrl: options.serverUrl,
                batchIntervalMs: options.batchIntervalMs ?? 2000,
                maxBatchSize: options.maxBatchSize ?? 100,
            };
        }
        enqueue(e) {
            this.buf.push({ ...e, siteId: this.siteId });
            if (this.buf.length >= this.opts.maxBatchSize)
                this.flush();
            if (!this.timer)
                this.timer = setTimeout(() => this.flush(), this.opts.batchIntervalMs);
        }
        async flush() {
            if (!this.buf.length)
                return;
            const payload = this.buf.splice(0, this.buf.length);
            clearTimeout(this.timer);
            this.timer = undefined;
            try {
                await fetch(`${this.opts.serverUrl}/api/events`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ events: payload }),
                    keepalive: true
                });
            }
            catch (e) {
                // requeue if fail
                this.buf.unshift(...payload);
            }
        }
    }

    function throttle(fn, ms) {
        let last = 0;
        let timeout;
        return function (...args) {
            const now = Date.now();
            const remaining = ms - (now - last);
            if (remaining <= 0) {
                clearTimeout(timeout);
                last = now;
                fn.apply(this, args);
            }
            else if (!timeout) {
                timeout = setTimeout(() => {
                    last = Date.now();
                    timeout = null;
                    fn.apply(this, args);
                }, remaining);
            }
        };
    }

    (function factory() {
        let transport = null;
        function init(options) {
            if (transport)
                return; // singleton
            const { siteId, serverUrl } = options;
            transport = new Transport(siteId, options);
            const send = (type) => (ev) => {
                if (!transport)
                    return;
                const target = ev.target;
                const tag = target?.tagName?.toLowerCase();
                const payload = {
                    path: location.pathname,
                    ts: Date.now(),
                    type,
                    x: ('clientX' in ev ? ev.clientX : 0),
                    y: ('clientY' in ev ? ev.clientY : 0),
                    w: window.innerWidth,
                    h: window.innerHeight,
                    tag,
                };
                transport.enqueue(payload);
            };
            window.addEventListener('click', send('click'), { passive: true });
            window.addEventListener('mousemove', throttle(send('hover'), 250), { passive: true });
            window.addEventListener('keydown', send('keydown'));
            window.addEventListener('scroll', throttle(send('scroll'), 500), { passive: true });
        }
        globalThis.FlowLensSDK = { init };
    })();

}));
//# sourceMappingURL=flowlens-sdk.umd.js.map
