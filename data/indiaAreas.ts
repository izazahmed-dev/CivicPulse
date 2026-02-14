// Comprehensive Hierarchical list of Indian locations
// Structure: State -> City -> Area -> Sub-area -> Locality

export interface LocationNode {
    name: string;
    state?: string;
    lat: number;
    lng: number;
    type: 'state' | 'city' | 'area' | 'subarea' | 'locality';
    pincode?: string;
    children?: LocationNode[];
}

export const INDIA_HIERARCHY: LocationNode[] = [
    {
        name: 'Tamil Nadu',
        type: 'state',
        lat: 13.0827,
        lng: 80.2707,
        children: [
            {
                name: 'Chennai',
                type: 'city',
                lat: 13.0827,
                lng: 80.2707,
                children: [
                    {
                        name: 'Adyar',
                        type: 'area',
                        lat: 13.0012,
                        lng: 80.2565,
                        children: [
                            {
                                name: 'Gandhi Nagar',
                                type: 'subarea',
                                lat: 13.0067,
                                lng: 80.2544,
                                children: [
                                    { name: '1st Main Road', type: 'locality', lat: 13.0070, lng: 80.2540 },
                                    { name: '2nd Main Road', type: 'locality', lat: 13.0065, lng: 80.2535 }
                                ]
                            },
                            {
                                name: 'Kasturba Nagar',
                                type: 'subarea',
                                lat: 12.9975,
                                lng: 80.2520,
                                children: [
                                    { name: 'Canal Bank Road', type: 'locality', lat: 12.9980, lng: 80.2515, pincode: '600020' }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'T. Nagar',
                        type: 'area',
                        lat: 13.0418,
                        lng: 80.2341,
                        children: [
                            {
                                name: 'Pondy Bazaar',
                                type: 'subarea',
                                lat: 13.0400,
                                lng: 80.2330,
                                children: [
                                    { name: 'Sir Thyagaraya Road', type: 'locality', lat: 13.0405, lng: 80.2335, pincode: '600017' }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'Anna Nagar',
                        type: 'area',
                        lat: 13.0850,
                        lng: 80.2101,
                        children: [
                            { name: 'Western Extension', type: 'subarea', lat: 13.0860, lng: 80.2050, pincode: '600101' },
                            { name: 'East', type: 'subarea', lat: 13.0870, lng: 80.2150, pincode: '600102' }
                        ]
                    },
                    {
                        name: 'Velachery',
                        type: 'area',
                        lat: 12.9815,
                        lng: 80.2180,
                        children: [
                            { name: 'Bypass Road', type: 'subarea', lat: 12.9820, lng: 80.2185, pincode: '600042' }
                        ]
                    }
                ]
            },
            {
                name: 'Coimbatore',
                type: 'city',
                lat: 11.0168,
                lng: 76.9558,
                children: [
                    {
                        name: 'RS Puram',
                        type: 'area',
                        lat: 11.0120,
                        lng: 76.9500,
                        children: [
                            { name: 'DB Road', type: 'subarea', lat: 11.0125, lng: 76.9505, pincode: '641002' }
                        ]
                    },
                    {
                        name: 'Gandhipuram',
                        type: 'area',
                        lat: 11.0180,
                        lng: 76.9670,
                        children: [
                            { name: 'Cross Cut Road', type: 'subarea', lat: 11.0185, lng: 76.9675, pincode: '641012' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'Maharashtra',
        type: 'state',
        lat: 19.0760,
        lng: 72.8777,
        children: [
            {
                name: 'Mumbai',
                type: 'city',
                lat: 19.0760,
                lng: 72.8777,
                children: [
                    {
                        name: 'Andheri',
                        type: 'area',
                        lat: 19.1136,
                        lng: 72.8697,
                        children: [
                            {
                                name: 'Andheri West',
                                type: 'subarea',
                                lat: 19.1170,
                                lng: 72.8330,
                                children: [
                                    { name: 'Lokhandwala Complex', type: 'locality', lat: 19.1300, lng: 72.8250, pincode: '400053' },
                                    { name: 'Versova', type: 'locality', lat: 19.1350, lng: 72.8140, pincode: '400061' }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'Bandra',
                        type: 'area',
                        lat: 19.0596,
                        lng: 72.8295,
                        children: [
                            { name: 'Bandra West', type: 'subarea', lat: 19.0590, lng: 72.8260, pincode: '400050' },
                            { name: 'Linking Road', type: 'subarea', lat: 19.0630, lng: 72.8310, pincode: '400050' }
                        ]
                    },
                    {
                        name: 'Powai',
                        type: 'area',
                        lat: 19.1176,
                        lng: 72.9060,
                        children: [
                            { name: 'Hiranandani Gardens', type: 'subarea', lat: 19.1190, lng: 72.9080, pincode: '400076' }
                        ]
                    }
                ]
            },
            {
                name: 'Pune',
                type: 'city',
                lat: 18.5204,
                lng: 73.8567,
                children: [
                    {
                        name: 'Hinjewadi',
                        type: 'area',
                        lat: 18.5912,
                        lng: 73.7389,
                        children: [
                            { name: 'Phase 1', type: 'subarea', lat: 18.5920, lng: 73.7390, pincode: '411057' }
                        ]
                    },
                    {
                        name: 'Koregaon Park',
                        type: 'area',
                        lat: 18.5370,
                        lng: 73.8930,
                        children: [
                            { name: 'Lane 6', type: 'subarea', lat: 18.5380, lng: 73.8940, pincode: '411001' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'Delhi',
        type: 'state',
        lat: 28.6139,
        lng: 77.2090,
        children: [
            {
                name: 'New Delhi',
                type: 'city',
                lat: 28.6139,
                lng: 77.2090,
                children: [
                    {
                        name: 'Saket',
                        type: 'area',
                        lat: 28.5245,
                        lng: 77.2066,
                        children: [
                            { name: 'Select Citywalk', type: 'subarea', lat: 28.5280, lng: 77.2180, pincode: '110017' }
                        ]
                    },
                    {
                        name: 'Connaught Place',
                        type: 'area',
                        lat: 28.6315,
                        lng: 77.2167,
                        children: [
                            { name: 'Inner Circle', type: 'subarea', lat: 28.6320, lng: 77.2170, pincode: '110001' },
                            { name: 'Outer Circle', type: 'subarea', lat: 28.6310, lng: 77.2160, pincode: '110001' }
                        ]
                    },
                    {
                        name: 'Dwarka',
                        type: 'area',
                        lat: 28.5921,
                        lng: 77.0460,
                        children: [
                            { name: 'Sector 21', type: 'subarea', lat: 28.5530, lng: 77.0580, pincode: '110077' },
                            { name: 'Sector 12', type: 'subarea', lat: 28.5930, lng: 77.0470, pincode: '110078' }
                        ]
                    }
                ]
            },
            {
                name: 'South Delhi',
                type: 'city',
                lat: 28.5355,
                lng: 77.2500,
                children: [
                    {
                        name: 'Hauz Khas',
                        type: 'area',
                        lat: 28.5494,
                        lng: 77.2001,
                        children: [
                            { name: 'Village', type: 'subarea', lat: 28.5500, lng: 77.2010, pincode: '110016' }
                        ]
                    },
                    {
                        name: 'Lajpat Nagar',
                        type: 'area',
                        lat: 28.5700,
                        lng: 77.2400,
                        children: [
                            { name: 'Central Market', type: 'subarea', lat: 28.5710, lng: 77.2410, pincode: '110024' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'Karnataka',
        type: 'state',
        lat: 12.9716,
        lng: 77.5946,
        children: [
            {
                name: 'Bengaluru',
                type: 'city',
                lat: 12.9716,
                lng: 77.5946,
                children: [
                    {
                        name: 'Koramangala',
                        type: 'area',
                        lat: 12.9352,
                        lng: 77.6245,
                        children: [
                            { name: '1st Block', type: 'subarea', lat: 12.9340, lng: 77.6220, pincode: '560034' },
                            { name: '4th Block', type: 'subarea', lat: 12.9360, lng: 77.6260, pincode: '560034' },
                            { name: '8th Block', type: 'subarea', lat: 12.9380, lng: 77.6280, pincode: '560095' }
                        ]
                    },
                    {
                        name: 'Indiranagar',
                        type: 'area',
                        lat: 12.9784,
                        lng: 77.6408,
                        children: [
                            { name: '100 Feet Road', type: 'subarea', lat: 12.9780, lng: 77.6400, pincode: '560038' },
                            { name: 'CMH Road', type: 'subarea', lat: 12.9810, lng: 77.6450, pincode: '560038' }
                        ]
                    },
                    {
                        name: 'Whitefield',
                        type: 'area',
                        lat: 12.9698,
                        lng: 77.7500,
                        children: [
                            { name: 'ITPL Main Road', type: 'subarea', lat: 12.9850, lng: 77.7320, pincode: '560066' },
                            { name: 'Varthur', type: 'subarea', lat: 12.9410, lng: 77.7430, pincode: '560087' }
                        ]
                    },
                    {
                        name: 'Jayanagar',
                        type: 'area',
                        lat: 12.9250,
                        lng: 77.5838,
                        children: [
                            { name: '4th Block', type: 'subarea', lat: 12.9260, lng: 77.5820, pincode: '560011' },
                            { name: '9th Block', type: 'subarea', lat: 12.9180, lng: 77.5850, pincode: '560069' }
                        ]
                    }
                ]
            },
            {
                name: 'Mysuru',
                type: 'city',
                lat: 12.2958,
                lng: 76.6394,
                children: [
                    {
                        name: 'Saraswathipuram',
                        type: 'area',
                        lat: 12.3100,
                        lng: 76.6500,
                        children: [
                            { name: 'Main Road', type: 'subarea', lat: 12.3110, lng: 76.6510, pincode: '570009' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'Telangana',
        type: 'state',
        lat: 17.3850,
        lng: 78.4867,
        children: [
            {
                name: 'Hyderabad',
                type: 'city',
                lat: 17.3850,
                lng: 78.4867,
                children: [
                    {
                        name: 'Banjara Hills',
                        type: 'area',
                        lat: 17.4156,
                        lng: 78.4347,
                        children: [
                            { name: 'Road No. 1', type: 'subarea', lat: 17.4160, lng: 78.4350, pincode: '500034' },
                            { name: 'Road No. 12', type: 'subarea', lat: 17.4180, lng: 78.4400, pincode: '500034' }
                        ]
                    },
                    {
                        name: 'Hitech City',
                        type: 'area',
                        lat: 17.4435,
                        lng: 78.3772,
                        children: [
                            { name: 'Cyber Towers', type: 'subarea', lat: 17.4440, lng: 78.3780, pincode: '500081' },
                            { name: 'Madhapur', type: 'subarea', lat: 17.4485, lng: 78.3908, pincode: '500081' }
                        ]
                    },
                    {
                        name: 'Jubilee Hills',
                        type: 'area',
                        lat: 17.4325,
                        lng: 78.4073,
                        children: [
                            { name: 'Road No. 36', type: 'subarea', lat: 17.4330, lng: 78.4080, pincode: '500033' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'West Bengal',
        type: 'state',
        lat: 22.5726,
        lng: 88.3639,
        children: [
            {
                name: 'Kolkata',
                type: 'city',
                lat: 22.5726,
                lng: 88.3639,
                children: [
                    {
                        name: 'Salt Lake',
                        type: 'area',
                        lat: 22.5804,
                        lng: 88.4136,
                        children: [
                            { name: 'Sector V', type: 'subarea', lat: 22.5690, lng: 88.4315, pincode: '700091' },
                            { name: 'Sector III', type: 'subarea', lat: 22.5780, lng: 88.4100, pincode: '700106' }
                        ]
                    },
                    {
                        name: 'Park Street',
                        type: 'area',
                        lat: 22.5551,
                        lng: 88.3517,
                        children: [
                            { name: 'Middleton Row', type: 'subarea', lat: 22.5540, lng: 88.3510, pincode: '700071' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'Gujarat',
        type: 'state',
        lat: 23.0225,
        lng: 72.5714,
        children: [
            {
                name: 'Ahmedabad',
                type: 'city',
                lat: 23.0225,
                lng: 72.5714,
                children: [
                    {
                        name: 'Navrangpura',
                        type: 'area',
                        lat: 23.0370,
                        lng: 72.5610,
                        children: [
                            { name: 'CG Road', type: 'subarea', lat: 23.0310, lng: 72.5590, pincode: '380009' }
                        ]
                    },
                    {
                        name: 'SG Highway',
                        type: 'area',
                        lat: 23.0469,
                        lng: 72.5272,
                        children: [
                            { name: 'Bodakdev', type: 'subarea', lat: 23.0400, lng: 72.5100, pincode: '380054' },
                            { name: 'Prahlad Nagar', type: 'subarea', lat: 23.0130, lng: 72.5120, pincode: '380015' }
                        ]
                    }
                ]
            },
            {
                name: 'Surat',
                type: 'city',
                lat: 21.1702,
                lng: 72.8311,
                children: [
                    {
                        name: 'Adajan',
                        type: 'area',
                        lat: 21.1800,
                        lng: 72.7970,
                        children: [
                            { name: 'Gama Road', type: 'subarea', lat: 21.1810, lng: 72.7980, pincode: '395009' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'Rajasthan',
        type: 'state',
        lat: 26.9124,
        lng: 75.7873,
        children: [
            {
                name: 'Jaipur',
                type: 'city',
                lat: 26.9124,
                lng: 75.7873,
                children: [
                    {
                        name: 'Malviya Nagar',
                        type: 'area',
                        lat: 26.8595,
                        lng: 75.8015,
                        children: [
                            { name: 'Sector 4', type: 'subarea', lat: 26.8600, lng: 75.8020, pincode: '302017' }
                        ]
                    },
                    {
                        name: 'C-Scheme',
                        type: 'area',
                        lat: 26.9120,
                        lng: 75.7870,
                        children: [
                            { name: 'Ashok Marg', type: 'subarea', lat: 26.9150, lng: 75.7900, pincode: '302001' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'Uttar Pradesh',
        type: 'state',
        lat: 26.8467,
        lng: 80.9462,
        children: [
            {
                name: 'Lucknow',
                type: 'city',
                lat: 26.8467,
                lng: 80.9462,
                children: [
                    {
                        name: 'Gomti Nagar',
                        type: 'area',
                        lat: 26.8563,
                        lng: 81.0048,
                        children: [
                            { name: 'Vibhuti Khand', type: 'subarea', lat: 26.8570, lng: 81.0050, pincode: '226010' }
                        ]
                    },
                    {
                        name: 'Hazratganj',
                        type: 'area',
                        lat: 26.8530,
                        lng: 80.9430,
                        children: [
                            { name: 'MG Road', type: 'subarea', lat: 26.8540, lng: 80.9440, pincode: '226001' }
                        ]
                    }
                ]
            },
            {
                name: 'Noida',
                type: 'city',
                lat: 28.5355,
                lng: 77.3910,
                children: [
                    {
                        name: 'Sector 18',
                        type: 'area',
                        lat: 28.5670,
                        lng: 77.3210,
                        children: [
                            { name: 'Atta Market', type: 'subarea', lat: 28.5680, lng: 77.3220, pincode: '201301' }
                        ]
                    },
                    {
                        name: 'Sector 62',
                        type: 'area',
                        lat: 28.6278,
                        lng: 77.3649,
                        children: [
                            { name: 'Block A', type: 'subarea', lat: 28.6280, lng: 77.3650, pincode: '201309' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'Kerala',
        type: 'state',
        lat: 9.9312,
        lng: 76.2673,
        children: [
            {
                name: 'Kochi',
                type: 'city',
                lat: 9.9312,
                lng: 76.2673,
                children: [
                    {
                        name: 'Marine Drive',
                        type: 'area',
                        lat: 9.9816,
                        lng: 76.2758,
                        children: [
                            { name: 'Shanmugham Road', type: 'subarea', lat: 9.9820, lng: 76.2760, pincode: '682031' }
                        ]
                    },
                    {
                        name: 'Kakkanad',
                        type: 'area',
                        lat: 10.0159,
                        lng: 76.3419,
                        children: [
                            { name: 'Infopark', type: 'subarea', lat: 10.0100, lng: 76.3610, pincode: '682042' }
                        ]
                    }
                ]
            },
            {
                name: 'Thiruvananthapuram',
                type: 'city',
                lat: 8.5241,
                lng: 76.9366,
                children: [
                    {
                        name: 'Technopark',
                        type: 'area',
                        lat: 8.5569,
                        lng: 76.8815,
                        children: [
                            { name: 'Phase 1', type: 'subarea', lat: 8.5570, lng: 76.8820, pincode: '695581' }
                        ]
                    }
                ]
            }
        ]
    }
];

// ─── Helper functions for cascading dropdowns ───

export function getStates(): LocationNode[] {
    return INDIA_HIERARCHY;
}

export function getCitiesByState(stateName: string): LocationNode[] {
    const state = INDIA_HIERARCHY.find(s => s.name === stateName);
    return state?.children || [];
}

export function getAreasByCity(stateName: string, cityName: string): LocationNode[] {
    const cities = getCitiesByState(stateName);
    const city = cities.find(c => c.name === cityName);
    return city?.children || [];
}

export function getSubareasByArea(stateName: string, cityName: string, areaName: string): LocationNode[] {
    const areas = getAreasByCity(stateName, cityName);
    const area = areas.find(a => a.name === areaName);
    return area?.children || [];
}

// ─── Types & utils ───

export interface SearchResult {
    name: string;
    path: string;
    lat: number;
    lng: number;
    type: string;
    pincode?: string;
}

export interface NearestLocationResult {
    location: SearchResult;
    distanceKm: number;
}

type LocationType = LocationNode['type'];

const DEFAULT_NEAREST_TYPES: LocationType[] = ['locality', 'subarea', 'area', 'city'];
const EARTH_RADIUS_KM = 6371;

function toRadians(value: number): number {
    return (value * Math.PI) / 180;
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const rLat1 = toRadians(lat1);
    const rLat2 = toRadians(lat2);

    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLng / 2) ** 2;

    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function findNearestLocation(
    lat: number,
    lng: number,
    types: LocationType[] = DEFAULT_NEAREST_TYPES
): NearestLocationResult | null {
    const candidates = FLAT_INDIA_AREAS.filter(loc => types.includes(loc.type as LocationType));
    if (candidates.length === 0) return null;

    let closest = candidates[0];
    let closestDistance = haversineKm(lat, lng, closest.lat, closest.lng);

    for (let i = 1; i < candidates.length; i += 1) {
        const candidate = candidates[i];
        const distance = haversineKm(lat, lng, candidate.lat, candidate.lng);
        if (distance < closestDistance) {
            closest = candidate;
            closestDistance = distance;
        }
    }

    return { location: closest, distanceKm: closestDistance };
}

// Flatten for search
function flattenHierarchy(nodes: LocationNode[], path = ''): SearchResult[] {
    let results: SearchResult[] = [];
    nodes.forEach(node => {
        const currentPath = path ? `${path} > ${node.name}` : node.name;
        results.push({
            name: node.name,
            path: currentPath,
            lat: node.lat,
            lng: node.lng,
            type: node.type,
            pincode: node.pincode
        });
        if (node.children) {
            results = [...results, ...flattenHierarchy(node.children, currentPath)];
        }
    });
    return results;
}

export const FLAT_INDIA_AREAS = flattenHierarchy(INDIA_HIERARCHY);

export function searchLocations(query: string): SearchResult[] {
    if (!query.trim()) return FLAT_INDIA_AREAS.filter(a => a.type === 'city' || a.type === 'state').slice(0, 20);
    const lowerQuery = query.toLowerCase();

    const pincodeMatches = FLAT_INDIA_AREAS.filter(loc => loc.pincode && loc.pincode.includes(lowerQuery));
    const textMatches = FLAT_INDIA_AREAS.filter(loc =>
        loc.path.toLowerCase().includes(lowerQuery) ||
        loc.name.toLowerCase().includes(lowerQuery)
    );

    const combined = [...pincodeMatches, ...textMatches.filter(t => !pincodeMatches.includes(t))];
    return combined.slice(0, 50);
}

export function findByPincode(pincode: string): SearchResult[] {
    const normalized = pincode.trim();
    if (!normalized) return [];
    return FLAT_INDIA_AREAS.filter(loc => loc.pincode === normalized);
}

// Backward compatibility helper
export interface Area {
    name: string;
    state: string;
    lat: number;
    lng: number;
}

export const INDIA_AREAS: Area[] = FLAT_INDIA_AREAS.map(f => ({
    name: f.name,
    state: f.path.split(' > ')[0],
    lat: f.lat,
    lng: f.lng
}));
