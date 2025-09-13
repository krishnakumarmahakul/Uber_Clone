const axios = require('axios');

// -------------------- Coordinate Parsing (still allows "lat,lon") --------------------
function tryParseCoordinates(input) {
  if (!input) return null;
  const coordRegex = /^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/;
  const match = input.match(coordRegex);
  if (!match) return null;

  const a = parseFloat(match[1]);
  const b = parseFloat(match[3]);

  let latitude, longitude;
  const aIsLat = a >= -90 && a <= 90;
  const bIsLat = b >= -90 && b <= 90;

  if (aIsLat && !bIsLat) {
    latitude = a; longitude = b;
  } else if (bIsLat && !aIsLat) {
    latitude = b; longitude = a;
  } else {
    // ambiguous -> assume (lat,lon) format
    latitude = a; longitude = b;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;

  return {
    provider: 'raw-coordinates',
    address: `${latitude},${longitude}`,
    latitude,
    longitude,
    raw: { latitude, longitude },
    variant: 'raw'
  };
}

// -------------------- Candidate Generation --------------------
function isBareName(str) {
  return /^[a-zA-Z\s]+$/.test(str) && !str.includes(',');
}

const DEFAULT_STATE_COUNTRY = process.env.DEFAULT_STATE_COUNTRY || 'Odisha, India';
const DEFAULT_COUNTRY = process.env.DEFAULT_COUNTRY || 'India';

function buildCandidateStrings(original) {
  const base = original.trim();
  if (!base) return [];
  if (!isBareName(base)) return [base]; // already detailed
  
  return [
    base,
    `${base}, ${DEFAULT_STATE_COUNTRY}`,
    `${base}, ${DEFAULT_COUNTRY}`
  ];
}

// -------------------- Odisha Coordinate Validation --------------------
function isWithinOdisha(latitude, longitude) {
  // Odisha bounding box: 81.4-87.6°E, 17.6-22.8°N
  return longitude >= 81.4 && longitude <= 87.6 && 
         latitude >= 17.6 && latitude <= 22.8;
}

// -------------------- Geocoding Helpers --------------------
async function geocodeWithMapbox(address) {
  if (!process.env.MAPBOX_API_KEY) return null;
  
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
  const { data } = await axios.get(url, {
    
    params: { 
      access_token: process.env.MAPBOX_API_KEY, 
      limit: 5,
      country: 'IN', // Restrict to India
      proximity: '85.8245,20.2961', // Bhubaneswar coordinates as center
      bbox: '81.4,17.6,87.6,22.8' // Odisha bounding box
    },
    validateStatus: s => s < 500
  });
  
  if (data?.message) return null;
  if (!data.features?.length) return null;

  // Filter for Odisha results
  const odishaFeatures = data.features.filter(f => {
    const [longitude, latitude] = f.center;
    const placeName = f.place_name.toLowerCase();
    
    // Check if coordinates are within Odisha OR place name mentions Odisha
    return isWithinOdisha(latitude, longitude) || 
           placeName.includes('odisha') ||
           (f.context && f.context.some(c => 
             c.text?.toLowerCase() === 'odisha' ||
             c.short_code?.toLowerCase() === 'in-od'
           ));
  });

  if (!odishaFeatures.length) return null;

  const feature = odishaFeatures[0];
  const [longitude, latitude] = feature.center;
  
  return {
    provider: 'mapbox',
    address: feature.place_name,
    latitude,
    longitude,
    raw: feature
  };
}

async function geocodeWithNominatim(address) {
  const url = 'https://nominatim.openstreetmap.org/search';
  const { data } = await axios.get(url, {
    params: { 
      q: address, 
      format: 'json', 
      limit: 5,
      countrycodes: 'in',
      viewbox: '81.4,22.8,87.6,17.6', // Odisha bounding box (left,top,right,bottom)
      bounded: 1 // Restrict results to viewbox
    },
    headers: { 'User-Agent': 'uber-clone-app/1.0' },
    validateStatus: s => s < 500
  });
  
  if (!Array.isArray(data) || !data.length) return null;
  
  // Filter for Odisha results
  const odishaResults = data.filter(r => {
    const displayName = r.display_name.toLowerCase();
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    
    // Check if coordinates are within Odisha OR display name mentions Odisha
    return isWithinOdisha(lat, lon) || displayName.includes('odisha');
  });
  
  if (!odishaResults.length) return null;
  
  const result = odishaResults[0];
  
  return {
    provider: 'nominatim',
    address: result.display_name,
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    raw: result
  };
}

// Try one candidate string
async function geocodeSingle(candidate) {
  // direct coordinates first
  const coord = tryParseCoordinates(candidate);
  if (coord) {
    // Validate coordinates are within Odisha
    if (!isWithinOdisha(coord.latitude, coord.longitude)) {
      console.log(`[DEBUG] Coordinates ${coord.latitude},${coord.longitude} are outside Odisha bounds`);
      return null;
    }
    return coord;
  }

  // Try Mapbox first
  let result = await geocodeWithMapbox(candidate);
  if (!result) {
    result = await geocodeWithNominatim(candidate);
  }
  
  if (result) {
    result.variant = candidate;
    // Double-check coordinates are within Odisha
    if (!isWithinOdisha(result.latitude, result.longitude)) {
      console.log(`[DEBUG] Result for "${candidate}" is outside Odisha: ${result.latitude},${result.longitude}`);
      return null;
    }
  }
  
  return result;
}

// -------------------- geocodeAll function --------------------
async function geocodeAll(candidates) {
  const results = [];
  const seen = new Set();
  
  for (const candidate of candidates) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    
    try {
      const result = await geocodeSingle(candidate);
      if (result) {
        result.original_query = candidates[0]; // Store original query
        result.variant = candidate; // Store which variant was used
        results.push(result);
        break; // Return first successful result
      }
    } catch (error) {
      console.log(`[DEBUG] Geocoding failed for "${candidate}": ${error.message}`);
      continue;
    }
  }
  
  return results;
}

// Geocode with fallback candidates
async function geocodeWithVariants(originalInput) {
  if (!originalInput || !originalInput.trim()) throw new Error('Address required');
  const candidates = buildCandidateStrings(originalInput);
  const seen = new Set();
  const outputs = [];

  for (const cand of candidates) {
    if (seen.has(cand)) continue;
    seen.add(cand);
    const res = await geocodeSingle(cand);
    if (res) {
      res.original_query = originalInput;
      outputs.push(res);
      // Return immediately on first success
      return { best: res, all: outputs, tried: candidates };
    }
  }
  return { best: null, all: outputs, tried: candidates };
}

// -------------------- Routing functions --------------------
async function getMapboxRoute(origin, destination, profile = 'driving') {
  if (!process.env.MAPBOX_API_KEY) {
    throw new Error('Mapbox API key not configured');
  }

  const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}`;
  
  const { data } = await axios.get(url, {
    params: {
      access_token: process.env.MAPBOX_API_KEY,
      geometries: 'geojson'
    },
    validateStatus: s => s < 500
  });

  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error('No route found');
  }

  return {
    distance: data.routes[0].distance,
    duration: data.routes[0].duration
  };
}

async function getOSRMRoute(origin, destination, profile = 'driving') {
  const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const osrmProfile = profile === 'driving' ? 'car' : profile;
  const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${coords}`;
  
  const { data } = await axios.get(url, {
    params: { overview: 'false' },
    validateStatus: s => s < 500
  });

  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error('No route found');
  }

  return {
    distance: data.routes[0].distance,
    duration: data.routes[0].duration
  };
}

// -------------------- Response Builder --------------------
function buildDistanceResponse(provider, route, originGeo, destGeo) {
  const totalSeconds = route.duration;
  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const human = `${hours}h ${minutes}m`;

  return {
    provider,
    origin: {
      query: originGeo.original_query || originGeo.address,
      used_variant: originGeo.variant,
      name: originGeo.address,
      latitude: originGeo.latitude,
      longitude: originGeo.longitude
    },
    destination: {
      query: destGeo.original_query || destGeo.address,
      used_variant: destGeo.variant,
      name: destGeo.address,
      latitude: destGeo.latitude,
      longitude: destGeo.longitude
    },
    distance_meters: route.distance,
    distance_km: +(route.distance / 1000).toFixed(2),
    duration_seconds: totalSeconds,
    duration: human
  };
}

// -------------------- Public Geocode API (exports) --------------------
module.exports.getAddressCordinate = async (address) => {
  const { best } = await geocodeWithVariants(address);
  if (!best) throw new Error(`No Odisha location found for "${address}"`);
  return best;

};


// -------------------- Distance & Time --------------------
module.exports.getDistanceTime = async (originName, destinationName, profile = 'driving') => {
  if (!originName || !destinationName) throw new Error('Address required');

  console.log(`[DEBUG] Getting distance between: "${originName}" -> "${destinationName}"`);

  // Build geocode variants
  const originCandidates = buildCandidateStrings(originName);
  const destCandidates = buildCandidateStrings(destinationName);

  console.log(`[DEBUG] Origin candidates:`, originCandidates);
  console.log(`[DEBUG] Destination candidates:`, destCandidates);

  // Geocode both locations
  const originGeos = await geocodeAll(originCandidates);
  const destGeos = await geocodeAll(destCandidates);

  if (!originGeos.length) throw new Error(`No Odisha location found for "${originName}"`);
  if (!destGeos.length) throw new Error(`No Odisha location found for "${destinationName}"`);

  console.log(`[DEBUG] Origin geocoded to:`, originGeos[0]);
  console.log(`[DEBUG] Destination geocoded to:`, destGeos[0]);

  // Enhanced distance validation for Odisha
  function validateDistance(o, d) {
    const lat1 = o.latitude * Math.PI / 180;
    const lat2 = d.latitude * Math.PI / 180;
    const deltaLat = (d.latitude - o.latitude) * Math.PI / 180;
    const deltaLon = (d.longitude - o.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const straightLineKm = 6371 * c; // Earth's radius in km

    console.log(`[DEBUG] Straight line distance: ${straightLineKm.toFixed(2)} km`);
    
    // Check if both locations are within Odisha bounds
    if (!isWithinOdisha(o.latitude, o.longitude)) {
      throw new Error(`Origin coordinates (${o.latitude}, ${o.longitude}) are outside Odisha. Found: ${o.address}`);
    }
    
    if (!isWithinOdisha(d.latitude, d.longitude)) {
      throw new Error(`Destination coordinates (${d.latitude}, ${d.longitude}) are outside Odisha. Found: ${d.address}`);
    }
    
    // For Odisha state, max distance should be around 300km
    if (straightLineKm > 300) {
      throw new Error(`Distance too large (${straightLineKm.toFixed(2)}km) for Odisha locations. Origin: ${o.address}, Destination: ${d.address}`);
    }
    
    return straightLineKm;
  }

  // Validate distance before routing
  validateDistance(originGeos[0], destGeos[0]);

  // Try routing with Mapbox first, then OSRM
  let routeResult;
  try {
    if (process.env.MAPBOX_API_KEY) {
      routeResult = await getMapboxRoute(originGeos[0], destGeos[0], profile);
      if (routeResult) {
        return buildDistanceResponse('mapbox', routeResult, originGeos[0], destGeos[0]);
      }
    }
  } catch (error) {
    console.log(`[DEBUG] Mapbox routing failed: ${error.message}`);
  }

  // Fallback to OSRM
  try {
    routeResult = await getOSRMRoute(originGeos[0], destGeos[0], profile);
    if (routeResult) {
      return buildDistanceResponse('osrm', routeResult, originGeos[0], destGeos[0]);
    }
  } catch (error) {
    console.log(`[DEBUG] OSRM routing failed: ${error.message}`);
  }

  throw new Error('No route found between the locations');
};

// -------------------- Location Suggestions --------------------
module.exports.getLocationSuggetion = async (input) => {
  if (!input || !input.trim()) throw new Error('input required');
  const query = input.trim();
  if (query.length < 2) throw new Error('input too short');

  const limit = parseInt(process.env.MAPBOX_SUGGEST_LIMIT || '5', 10);

  // Odisha bounding box
  const ODISHA_BBOX_STR = process.env.ODISHA_BBOX || '81.4,17.6,87.6,22.8';
  const [minLon, minLat, maxLon, maxLat] = ODISHA_BBOX_STR.split(',').map(Number);

  function isOdishaMapboxFeature(f) {
    if (!f) return false;
    const [longitude, latitude] = f.center;
    const placeName = f.place_name.toLowerCase();
    
    return isWithinOdisha(latitude, longitude) || 
           placeName.includes('odisha') ||
           (Array.isArray(f.context) && f.context.some(c =>
             (c.text || '').toLowerCase() === 'odisha' ||
             (c.short_code || '').toLowerCase() === 'in-od'
           ));
  }

  function isOdishaNominatim(rec) {
    const lat = parseFloat(rec.lat);
    const lon = parseFloat(rec.lon);
    return isWithinOdisha(lat, lon) || 
           (rec.display_name || '').toLowerCase().includes('odisha');
  }

  // Prefer Mapbox if key present
  if (process.env.MAPBOX_API_KEY) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
      const { data } = await axios.get(url, {
        params: {
          access_token: process.env.MAPBOX_API_KEY,
          autocomplete: true,
          limit,
          country: 'IN',
          types: 'place,locality,neighborhood,poi,address',
          bbox: `${minLon},${minLat},${maxLon},${maxLat}`, // constrain to Odisha region
          proximity: '85.8245,20.2961' // Bhubaneswar coordinates
        },
        validateStatus: s => s < 500
      });

      if (data?.message) throw new Error(data.message);

      const suggestions = (data.features || [])
        .filter(isOdishaMapboxFeature)
        .map(f => ({
          id: f.id,
          name: f.text,
          full_address: f.place_name,
          latitude: f.center[1],
          longitude: f.center[0],
          types: f.place_type,
          provider: 'mapbox'
        }));

      return { query, region: 'Odisha, India', suggestions };
    } catch (e) {
      console.log(`[DEBUG] Mapbox suggestions failed: ${e.message}`);
      // fall through to Nominatim fallback
    }
  }

  // Fallback: Nominatim restricted to Odisha area
  const nominatimUrl = 'https://nominatim.openstreetmap.org/search';
  const viewbox = `${minLon},${maxLat},${maxLon},${minLat}`; // left,top,right,bottom
  
  try {
    const { data } = await axios.get(nominatimUrl, {
      params: {
        q: query,
        format: 'json',
        limit,
        viewbox,
        bounded: 1,
        countrycodes: 'in'
      },
      headers: { 'User-Agent': 'uber-clone-app/1.0' },
      validateStatus: s => s < 500
    });

    const suggestions = Array.isArray(data)
      ? data
          .filter(isOdishaNominatim)
          .map(r => ({
            id: r.place_id,
            name: r.display_name.split(',')[0],
            full_address: r.display_name,
            latitude: parseFloat(r.lat),
            longitude: parseFloat(r.lon),
            types: [r.type],
            provider: 'nominatim'
          }))
      : [];

    return { query, region: 'Odisha, India', suggestions };
  } catch (e) {
    console.log(`[DEBUG] Nominatim suggestions failed: ${e.message}`);
    return { query, region: 'Odisha, India', suggestions: [] };
  }
};