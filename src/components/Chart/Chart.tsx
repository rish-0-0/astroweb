import { useMemo, useState } from 'preact/hooks';
import { JSX } from "preact";

// Define types based on your provided JSON structure.
interface InitDate {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    jd_ut: number;
}

export interface Planet {
    index: number;
    name: string;
    long: number;   // ecliptic longitude in degrees (D-1 chart)
    lat: number;
    distance: number;
    speed: number;
    long_s: string;
    iflagret: number;
    error: number;
}

interface Ascmc {
    name: string;
    long: number;
    long_s: string;
}

export interface House {
    name: string;   // e.g., "1", "2", etc.
    long: number;
    long_s: string;
}

export interface ChartData {
    initDate: InitDate[];
    planets: Planet[];
    ascmc: Ascmc[];
    house: House[];  // (this can be maintained for other parts of your project)
}

// Abbreviations for planet symbols.
const abbreviations: Record<string, string> = {
    "Sun": "Su",
    "Moon": "Mo",
    "Mercury": "Me",
    "Venus": "Ve",
    "Mars": "Ma",
    "Jupiter": "Ju",
    "Saturn": "Sa",
    "Uranus": "Ur",
    "Neptune": "Ne",
    "Pluto": "Pl",
    "mean Node": "Ra",
    "true Node": "Tr*",
    "Chiron": "Ch",
    "Pholus": "Ph",
    "Ceres": "Ce",
    "Pallas": "Pa",
    "Juno": "Jun",
    "Vesta": "Vs",
    "intp. Apogee": "Ap",
    "intp. Perigee": "Pe",
    "Asc": "La⁋",
    "Ketu": "Ke" // Added Ketu with abbreviation "Ke"
};

const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Helper function to compute nakshatra details from an ecliptic longitude.
function getNakshatraDetails(longitude: number): string {
    const nakshatras = [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
        "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
        "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
        "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
        "Uttara Bhadrapada", "Revati"
    ];
    const nakshatraLords = [
        "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter",
        "Saturn", "Mercury", "Ketu", "Venus", "Sun", "Moon",
        "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", "Ketu", "Venus",
        "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
    ];
    const segment = 360 / 27; // ≈13.3333°
    const index = Math.floor(longitude / segment) % 27;
    const nakshatra = nakshatras[index];
    const lord = nakshatraLords[index];
    const pada = Math.floor(((longitude % segment) / segment) * 4) + 1;
    return `${nakshatra} (Pada ${pada}, Lord ${lord})`;
}

// Helper function to get zodiac sign (Rashi) from an ecliptic longitude.
function getZodiac(longitude: number): string {
    const index = Math.floor((longitude % 360) / 30);
    return zodiacSigns[index];
}

function getZodiacFromHouse(house: string, ascRashi: string): string {
    const ascRashiIndex = zodiacSigns.findIndex(value => value === ascRashi);
    return zodiacSigns[(ascRashiIndex + Number(house) - 1) % 12];
}

/**
 * Calculates the whole sign house number for a planet.
 * The whole sign system assigns House 1 to every planet
 * in the sign of the Ascendant, House 2 to the next sign, etc.
 */
function getWholeSignHouse(planetLong: number, ascLong: number): string {
    const normPlanet = ((planetLong % 360) + 360) % 360;
    const normAsc = ((ascLong % 360) + 360) % 360;
    const planetSign = Math.floor(normPlanet / 30); // 0 = Aries, etc.
    const ascSign = Math.floor(normAsc / 30);
    const houseNum = ((planetSign - ascSign + 12) % 12) + 1;
    return houseNum.toString();
}

/**
 * Convert a D-1 longitude to D-9 (Navamsa) longitude.
 * For D-9, each 30° sign is divided into 9 equal parts (3.333° each).
 * The conversion uses the element-based starting index.
 */
function getD9Longitude(d1Longitude: number): number {
    const signIndex = Math.floor(d1Longitude / 30); // D-1 sign index (0-11)
    const degreeInSign = d1Longitude % 30;
    const navamsaSize = 30 / 9; // ~3.3333°
    const navamsaIndex = Math.floor(degreeInSign / navamsaSize); // 0-8
    // Fraction within the current Navamsa segment
    const fraction = (degreeInSign % navamsaSize) / navamsaSize;

    // Determine the element of the D-1 sign
    let element: "fire" | "earth" | "air" | "water";
    if ([0, 4, 8].includes(signIndex)) element = "fire";
    else if ([1, 5, 9].includes(signIndex)) element = "earth";
    else if ([2, 6, 10].includes(signIndex)) element = "air";
    else element = "water";

    // Element starting mapping for D-9 (indices relative to zodiacSigns array)
    const elementStartMap = {
        fire: 0,      // Aries
        earth: 9,     // Capricorn (index 9)
        air: 6,       // Libra (index 6)
        water: 3      // Cancer (index 3)
    };

    const startSignIndex = elementStartMap[element];
    const d9SignIndex = (startSignIndex + navamsaIndex) % 12;
    // The D-9 longitude is the beginning of that D-9 sign plus the intra-navamsa fraction
    return d9SignIndex * 30 + fraction * navamsaSize;
}

/**
 * General conversion function for divisional charts.
 * Currently supports D-1 and D-9. Other charts default to D-1.
 */
function getDChartLongitude(dChart: string, d1Longitude: number): number {
    if (dChart === "D-1") {
        return d1Longitude;
    } else if (dChart === "D-9") {
        return getD9Longitude(d1Longitude);
    } else {
        // Future: add conversion logic for other divisional charts (D-2, D-3, etc.)
        return d1Longitude;
    }
}

// Grid mapping for the 12 houses on a 4x4 grid (visual placement).
const gridMapping: { house: string; row: number; col: number }[] = [
    { house: "12", row: 1, col: 1 },
    { house: "1",  row: 1, col: 2 },
    { house: "2",  row: 1, col: 3 },
    { house: "3",  row: 1, col: 4 },
    { house: "4",  row: 2, col: 4 },
    { house: "5",  row: 3, col: 4 },
    { house: "6",  row: 4, col: 4 },
    { house: "7",  row: 4, col: 3 },
    { house: "8",  row: 4, col: 2 },
    { house: "9",  row: 4, col: 1 },
    { house: "10", row: 3, col: 1 },
    { house: "11", row: 2, col: 1 }
];

interface ChartProps {
    chartData: ChartData;
}

export function Chart({ chartData }: ChartProps) {
    const { planets, ascmc } = chartData;

    // State for the selected divisional chart (D-1 by default).
    const [selectedDChart, setSelectedDChart] = useState<string>("D-1");

    // Use Ascendant from ascmc for D-1 calculations then convert according to selected D-chart.
    const ascD1Long = ascmc[0].long;
    const ascLong = getDChartLongitude(selectedDChart, ascD1Long);

    // State for the currently selected body (on click).
    const [selectedBody, setSelectedBody] = useState<{ name: string; long: number; long_s: string } | null>(null);

    // Find the Rahu node (assuming either "true Node" or "mean Node" represents Rahu).
    const rahuBody = planets.find(p => p.name === "true Node" || p.name === "mean Node");

    // Compute Ketu as the opposite point to Rahu.
    const ketuBody = rahuBody
        ? {
            name: "Ketu",
            long: (rahuBody.long + 180) % 360,
            long_s: ((rahuBody.long + 180) % 360).toFixed(2)
        }
        : null;

    // Build all bodies to display (using the original D-1 values and converting them).
    const allBodies = [
        { name: "Asc", long: ascmc[0].long, long_s: ascmc[0].long_s },
        ...planets,
        ...(ketuBody ? [ketuBody] : [])
    ];

    // Convert each body's longitude to the selected D-chart and group bodies by house.
    const bodiesByHouse = useMemo(() => {
        const grouping: Record<string, { name: string; long: number; long_s: string }[]> = {};
        // Initialize grouping for 12 houses.
        for (let i = 1; i <= 12; i++) {
            grouping[i.toString()] = [];
        }
        for (const body of allBodies) {
            const convertedLong = getDChartLongitude(selectedDChart, body.long);
            const houseNumber = getWholeSignHouse(convertedLong, ascLong);
            grouping[houseNumber].push(body);
        }
        return grouping;
    }, [allBodies, ascLong, selectedDChart]);

    // Compute the Ascendant's zodiac sign based on converted longitude.
    const rashi = getZodiac(ascLong);

    // Inline styles.
    const gridContainerStyle: JSX.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: '5px',
        maxWidth: '600px',
        margin: 'auto',
        border: '2px solid #666',
        padding: '10px'
    };

    const cellStyle: JSX.CSSProperties = {
        border: '1px solid #888',
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        position: 'relative'
    };

    const planetStyle: JSX.CSSProperties = {
        padding: '2px 4px',
        backgroundColor: '#444',
        color: '#fff',
        borderRadius: '4px',
        margin: '2px',
        cursor: 'pointer'
    };

    // Render a planet symbol with an onClick handler.
    const renderBodySymbol = (body: { name: string; long: number; long_s: string }, index: number) => {
        const abbrev = abbreviations[body.name] || body.name.substring(0, 2);
        return (
            <span
                key={index}
                style={planetStyle}
                onClick={() => setSelectedBody(body)}
            >
                {abbrev}
            </span>
        );
    };

    // Map grid cells for each house.
    const gridCells = gridMapping.map((cell, idx) => {
        const bodies = bodiesByHouse[cell.house] || [];
        return (
            <div
                key={idx}
                style={{
                    ...cellStyle,
                    gridColumn: cell.col,
                    gridRow: cell.row
                }}
            >
                <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>
                    House {cell.house}
                </div>
                <small style={{ fontWeight: 'bold' }}>
                    Rashi: {getZodiacFromHouse(cell.house, rashi)}
                </small>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {bodies.map((body, i) => renderBodySymbol(body, i))}
                </div>
            </div>
        );
    });

    // Center cell displays either the default Ascendant data or details for a selected planet.
    const centerCell = (
        <div
            key="center"
            style={{
                gridColumn: '2 / span 2',
                gridRow: '2 / span 2',
                ...cellStyle,
                backgroundColor: '#222',
                color: '#fff'
            }}
        >
            <div style={{ fontWeight: 'bold' }}>
                {selectedDChart} Chart
            </div>
            <div>Ascendant Zodiac: {rashi}</div>
            <div style={{ marginTop: '4px', fontSize: '0.8rem' }}>
                Asc: Lagna ({getNakshatraDetails(ascD1Long)})
            </div>
            {selectedBody && (
                <>
                    <div style={{ fontWeight: 'bold' }}>
                        {abbreviations[selectedBody.name] || selectedBody.name} - {selectedBody.name}
                    </div>
                    <div>{getNakshatraDetails(selectedBody.long)}</div>
                </>
            )}
        </div>
    );

    return (
        <div>
            {/* Divisional Chart Dropdown */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <label htmlFor="dchart-select" style={{ marginRight: '8px' }}>
                    Select Divisional Chart:
                </label>
                <select
                    id="dchart-select"
                    value={selectedDChart}
                    onChange={e => setSelectedDChart(e.currentTarget.value)}
                    style={{ fontSize: '1rem', padding: '4px' }}
                >
                    <option value="D-1">D-1 (Birth Chart)</option>
                    <option value="D-9">D-9 (Navamsa Chart)</option>
                    {/* Future options: D-2, D-3, etc. */}
                </select>
            </div>
            <h2 style={{ textAlign: 'center' }}>
                {selectedDChart} Chart
            </h2>
            <div style={gridContainerStyle}>
                {gridCells}
                {centerCell}
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '10px', color: '#ccc' }}>
                Click on a planet symbol to display its nakshatra details in the center.
            </p>
        </div>
    );
}
