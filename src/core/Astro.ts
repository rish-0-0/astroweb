export class Astro {
    public preloadWebAssemblyModule(cb: (err?: Error) => void): void {
        const url = '/astroweb/swisseph/swissephPreload.js';
        const preloadWorker = new Worker(url);
        preloadWorker.onmessage = (event: MessageEvent) => {
            preloadWorker.terminate();
            if (event.data !== 'preload') {
                const err = new Error('Failed to pre load swisseph data ' + event.data);
                return cb(err);
            }
            return cb();
        }
    }
}

export const astro = new Astro();