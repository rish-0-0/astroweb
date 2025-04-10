self.Module = {
    onRuntimeInitialized: function () {
        postMessage("preload");
    },
};
self.importScripts("astro.js");