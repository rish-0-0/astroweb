// Define an interface for the birth chart data with optional houseSystem parameter.
export interface BirthInfo {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    /**
     * Timezone offset in minutes (e.g., -300 for EST during standard time)
     */
    timezone: number;
    latitude: number;
    longitude: number;
    /** A human-readable location name */
    locationName: string;
    /** Altitude in meters above sea level (optional) */
    altitude?: number;
    /**
     * Optionally, specify the house system.
     * Defaults to "W" (Whole Sign Houses) for Vedic astrology.
     */
    houseSystem?: string;
}

export class Astro {
    /**
     * Preloads the Swiss Ephemeris WebAssembly module.
     * Calls the callback with an Error if there is a problem.
     */
    public preloadWebAssemblyModule(cb: (err?: Error) => void): void {
        const url = '/astroweb/swisseph/swissephPreload.js';
        const preloadWorker = new Worker(url);
        preloadWorker.onmessage = (event: MessageEvent) => {
            preloadWorker.terminate();
            if (event.data !== 'preload') {
                const err = new Error('Failed to preload swisseph data: ' + event.data);
                return cb(err);
            }
            return cb();
        };
    }

    /**
     * Generates a Vedic birth chart using the Swiss Ephemeris library running in WebAssembly.
     *
     * For Vedic astrology:
     * - Uses the Whole Sign House system (default: "W") rather than Placidus.
     * - Is intended for sidereal computations (which may include applying an ayanamsa).
     *
     * @param birthInfo - An object containing the birth data.
     * @param callback  - A function that receives the resulting chart data (or an Error).
     */
    public generateBirthChart(birthInfo: BirthInfo, callback: (result: string | Error) => void): void {
        // Use the swisseph worker – adjust the URL if you’re using a different script.
        const workerUrl = '/astroweb/swisseph/swisseph.js';
        const chartWorker = new Worker(workerUrl);

        chartWorker.onmessage = (event: MessageEvent) => {
            chartWorker.terminate();
            const result = event.data;
            // Depending on your implementation you may want to handle any errors here.
            callback(result);
        };

        // Prepare the data array for the WASM function call.
        const dataArray = this.prepareDataArray(birthInfo);
        // Post the prepared data to the worker.
        chartWorker.postMessage(dataArray);
    }

    /**
     * Prepares an array of parameters for the Swiss Ephemeris "get" function.
     *
     * The array elements are mapped as follows:
     *  0: year
     *  1: month
     *  2: day
     *  3: hour
     *  4: minute
     *  5: second
     *  6: timezone (in minutes)
     *  7: latitude
     *  8: longitude
     *  9: location name
     * 10: altitude (defaults to 0 if undefined)
     * 11: extra numeric flag (default = 0)
     * 12: extra numeric flag (default = 0)
     * 13: house system identifier – defaults to "W" for Whole Sign Houses
     * 14: additional configuration – set to "vedic" to indicate sidereal calculations
     *
     * @param birthInfo - The birth information for generating a birth chart.
     * @returns An array to be passed to the SWISSEPH get function.
     */
    private prepareDataArray(birthInfo: BirthInfo): Array<number | string> {
        return [
            birthInfo.year,
            birthInfo.month,
            birthInfo.day,
            birthInfo.hour,
            birthInfo.minute,
            birthInfo.second,
            birthInfo.timezone,
            birthInfo.latitude,
            birthInfo.longitude,
            birthInfo.locationName,
            birthInfo.altitude || 0,
            0,  // Extra option: numeric flag (reserved for mode selection or similar)
            0,  // Extra option: additional numeric parameter (reserved for future use)
            birthInfo.houseSystem || "W",  // Default to "W" for Whole Sign Houses (Vedic)
            "vedic",  // Additional config parameter indicating Vedic (sidereal) calculation
            1, // vedic system call
        ];
    }
}

// Exporting an instance for easy use.
export const astro = new Astro();
