// BirthInput.tsx
import { useState } from 'preact/hooks';
import { astro, BirthInfo } from '../../core/Astro';
import { Validation } from './Validations';

interface BirthInputProps {
    onSubmitBirthInfo: (str: string) => void;
}

export function BirthInput(props: BirthInputProps) {
    // State for inputs
    const [birthDate, setBirthDate] = useState<string>('');
    const [birthTime, setBirthTime] = useState<string>('');
    const [timezone, setTimezone] = useState<string>('');
    const [latitude, setLatitude] = useState<string>('');
    const [longitude, setLongitude] = useState<string>('');
    const [locationName, setLocationName] = useState<string>('');
    const [altitude, setAltitude] = useState<string>('0');
    const [houseSystem, setHouseSystem] = useState<string>('W');

    // State for errors, result, and loading status
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        // Validate each field
        if (!Validation.validateDate(birthDate)) {
            newErrors.birthDate = 'Invalid date format. Expected: YYYY-MM-DD';
        }
        if (!Validation.validateTime(birthTime)) {
            newErrors.birthTime = 'Invalid time format. Expected: HH:MM or HH:MM:SS';
        }
        if (!Validation.validateTimezone(timezone)) {
            newErrors.timezone = 'Invalid timezone value.';
        }
        if (!Validation.validateLatitude(latitude)) {
            newErrors.latitude = 'Latitude must be between -90 and 90.';
        }
        if (!Validation.validateLongitude(longitude)) {
            newErrors.longitude = 'Longitude must be between -180 and 180.';
        }
        if (!Validation.validateLocationName(locationName)) {
            newErrors.locationName = 'Location name is required.';
        }
        if (!Validation.validateAltitude(altitude)) {
            newErrors.altitude = 'Invalid altitude value.';
        }
        if (!Validation.validateHouseSystem(houseSystem)) {
            newErrors.houseSystem = 'Invalid house system.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});

        // Parse inputs to create the BirthInfo object
        const [yearStr, monthStr, dayStr] = birthDate.split('-');
        const [hourStr, minuteStr, secondStr] = birthTime.split(':');
        const birthInfo: BirthInfo = {
            year: parseInt(yearStr, 10),
            month: parseInt(monthStr, 10),
            day: parseInt(dayStr, 10),
            hour: parseInt(hourStr, 10),
            minute: parseInt(minuteStr, 10),
            second: secondStr ? parseInt(secondStr, 10) : 0,
            timezone: parseInt(timezone, 10),
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            locationName,
            altitude: parseFloat(altitude),
            houseSystem,
        };

        setLoading(true);
        astro.generateBirthChart(birthInfo, (res: string | Error) => {
            setLoading(false);
            if (res instanceof Error) {
                setErrors({ global: res.message });
            } else {
                props.onSubmitBirthInfo(res);
            }
        });
    };

    // Inline style for form groups (medium size inputs)
    const groupStyle = { flex: '1', minWidth: '150px' };
    // Container style for flex rows
    const rowStyle = { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend><h3 className="text-center">Birth Information</h3></legend>

                {/* Row 1: Date of Birth, Time of Birth, Timezone */}
                <div style={rowStyle}>
                    <div className="form-group" style={groupStyle}>
                        <label htmlFor="birthDate">Date of Birth:</label>
                        <input
                            id="birthDate"
                            type="date"
                            value={birthDate}
                            onInput={(e: any) => setBirthDate(e.target.value)}
                            required
                        />
                        {errors.birthDate && <small style={{ color: 'red' }}>{errors.birthDate}</small>}
                    </div>

                    <div className="form-group" style={groupStyle}>
                        <label htmlFor="birthTime">Time of Birth:</label>
                        <input
                            id="birthTime"
                            type="time"
                            value={birthTime}
                            onInput={(e: any) => setBirthTime(e.target.value)}
                            step="1"
                            required
                        />
                        {errors.birthTime && <small style={{ color: 'red' }}>{errors.birthTime}</small>}
                    </div>

                    <div className="form-group" style={groupStyle}>
                        <label htmlFor="timezone">Timezone Offset (min):</label>
                        <input
                            id="timezone"
                            type="number"
                            value={timezone}
                            onInput={(e: any) => setTimezone(e.target.value)}
                            placeholder="e.g., 330"
                            required
                        />
                        {errors.timezone && <small style={{ color: 'red' }}>{errors.timezone}</small>}
                    </div>
                </div>

                {/* Row 2: Latitude, Longitude, Altitude */}
                <div style={rowStyle}>
                    <div className="form-group" style={groupStyle}>
                        <label htmlFor="latitude">Latitude:</label>
                        <input
                            id="latitude"
                            type="number"
                            value={latitude}
                            onInput={(e: any) => setLatitude(e.target.value)}
                            step="any"
                            placeholder="e.g., 28.6139"
                            required
                        />
                        {errors.latitude && <small style={{ color: 'red' }}>{errors.latitude}</small>}
                    </div>

                    <div className="form-group" style={groupStyle}>
                        <label htmlFor="longitude">Longitude:</label>
                        <input
                            id="longitude"
                            type="number"
                            value={longitude}
                            onInput={(e: any) => setLongitude(e.target.value)}
                            step="any"
                            placeholder="e.g., 77.2090"
                            required
                        />
                        {errors.longitude && <small style={{ color: 'red' }}>{errors.longitude}</small>}
                    </div>

                    <div className="form-group" style={groupStyle}>
                        <label htmlFor="altitude">Altitude (m):</label>
                        <input
                            id="altitude"
                            type="number"
                            value={altitude}
                            onInput={(e: any) => setAltitude(e.target.value)}
                            placeholder="Optional"
                        />
                        {errors.altitude && <small style={{ color: 'red' }}>{errors.altitude}</small>}
                    </div>
                </div>

                {/* Row 3: Location Name */}
                <div style={{ marginBottom: '1rem' }}>
                    <div className="form-group">
                        <label htmlFor="locationName">Location Name:</label>
                        <input
                            id="locationName"
                            type="text"
                            value={locationName}
                            onInput={(e: any) => setLocationName(e.target.value)}
                            placeholder="City, Country"
                            required
                        />
                        {errors.locationName && <small style={{ color: 'red' }}>{errors.locationName}</small>}
                    </div>
                </div>

                {/* Row 4: House System */}
                <div style={{ marginBottom: '1rem' }}>
                    <div className="form-group">
                        <label htmlFor="houseSystem">House System:</label>
                        <select
                            id="houseSystem"
                            disabled
                            value={houseSystem}
                            onChange={(e: any) => setHouseSystem(e.target.value)}
                        >
                            <option value="W">Whole Sign Houses (Vedic)</option>
                            <option value="P">Placidus (Western)</option>
                        </select>
                        {errors.houseSystem && <small style={{ color: 'red' }}>{errors.houseSystem}</small>}
                    </div>
                </div>

                {/* Submission and Global Feedback */}
                <div style={{ marginTop: '1rem' }}>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Generating chart...' : 'Generate Chart(s)'}
                    </button>
                </div>

                {errors.global && <div style={{ color: 'red', marginTop: '1rem' }}>{errors.global}</div>}
            </fieldset>
        </form>
    );
}
