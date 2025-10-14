import { Transport } from './transport';
import type { SDKOptions } from './types';
import { throttle } from './utils';


(function factory() {
    let transport: Transport | null = null;

    function init(options: SDKOptions) {
        if (transport) return; // singleton
        const { siteId, serverUrl } = options;
        transport = new Transport(siteId, options);

        const send = (type: 'click' | 'hover' | 'keydown' | 'scroll') => (ev: any) => {
            if (!transport) return;
            const target = ev.target as HTMLElement | null;
            const tag = target?.tagName?.toLowerCase();
            const payload = {
                path: location.pathname,
                ts: Date.now(),
                type,
                x: ('clientX' in ev ? ev.clientX : 0) as number,
                y: ('clientY' in ev ? ev.clientY : 0) as number,
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

    (globalThis as any).FlowLensSDK = { init };
})();

export { };