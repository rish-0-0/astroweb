/**
 * Validation.ts
 *
 * This abstract class provides static methods to validate each form input
 * used in the birth chart form. You can call these validators from your
 * form component to ensure that all values meet the required formats and ranges.
 */
export abstract class Validation {
    /**
     * Validates that the date string is in the format YYYY-MM-DD.
     * @param date - The date string to validate.
     * @returns True if the date is valid, false otherwise.
     */
    static validateDate(date: string): boolean {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        return regex.test(date);
    }

    /**
     * Validates that the time string is in the format HH:MM or HH:MM:SS.
     * @param time - The time string to validate.
     * @returns True if the time is valid, false otherwise.
     */
    static validateTime(time: string): boolean {
        const regex = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
        return regex.test(time);
    }

    /**
     * Validates that the timezone value is a valid number.
     * It also ensures that empty strings return false.
     * @param timezone - The timezone string to validate.
     * @returns True if the timezone is valid, false otherwise.
     */
    static validateTimezone(timezone: string): boolean {
        if (timezone.trim() === '') return false;  // Reject empty strings
        return !isNaN(Number(timezone));  // Ensure the value is a valid number
    }

    /**
     * Validates that the latitude is a number between -90 and 90.
     * @param latitude - The latitude value to validate.
     * @returns True if the latitude is valid, false otherwise.
     */
    static validateLatitude(latitude: string): boolean {
        const lat = parseFloat(latitude);
        return !isNaN(lat) && lat >= -90 && lat <= 90;
    }

    /**
     * Validates that the longitude is a number between -180 and 180.
     * @param longitude - The longitude value to validate.
     * @returns True if the longitude is valid, false otherwise.
     */
    static validateLongitude(longitude: string): boolean {
        const lon = parseFloat(longitude);
        return !isNaN(lon) && lon >= -180 && lon <= 180;
    }

    /**
     * Validates that the location name is a non-empty string.
     * @param locationName - The location name to validate.
     * @returns True if the location name is valid, false otherwise.
     */
    static validateLocationName(locationName: string): boolean {
        return locationName.trim().length > 0;
    }

    /**
     * Validates that the altitude is a valid number if provided.
     * An empty altitude (or one that only contains whitespace) is considered valid.
     * @param altitude - The altitude value to validate.
     * @returns True if the altitude is valid, false otherwise.
     */
    static validateAltitude(altitude: string): boolean {
        if (altitude.trim() === '') return true; // optional field
        return !isNaN(Number(altitude));
    }

    /**
     * Validates that the house system is one of the accepted values: "W" (Whole Sign) or "P" (Placidus).
     * @param houseSystem - The house system value to validate.
     * @returns True if the house system is valid, false otherwise.
     */
    static validateHouseSystem(houseSystem: string): boolean {
        return houseSystem === 'W' || houseSystem === 'P';
    }
}
