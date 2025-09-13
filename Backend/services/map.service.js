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
    // ambiguous -> assume (lon,lat)
    longitude = a; latitude = b;
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

// -------------------- Geocoding Helpers --------------------
async function geocodeWithMapbox(address) {
  if (!process.env.MAPBOX_API_KEY) return null;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
  const { data } = await axios.get(url, {
    params: { access_token: process.env.MAPBOX_API_KEY, limit: 1 },
    validateStatus: s => s < 500
  });
  if (data?.message) return null;
  if (!data.features?.length) return null;
  const f = data.features[0];
  const [longitude, latitude] = f.center;
  return {
    provider: 'mapbox',
    address: f.place_name,
    latitude,
    longitude,
    raw: f
  };
}

async function geocodeWithNominatim(address) {
  const url = 'https://nominatim.openstreetmap.org/search';
  const { data } = await axios.get(url, {
    params: { q: address, format: 'json', limit: 1 },
    headers: { 'User-Agent': 'uber-clone-app/1.0' },
    validateStatus: s => s < 500
  });
  if (!Array.isArray(data) || !data.length) return null;
  return {
    provider: 'nominatim',
    address: data[0].display_name,
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
    raw: data[0]
  };
}

// Try one candidate string
async function geocodeSingle(candidate) {
  // direct coordinates first
  const coord = tryParseCoordinates(candidate);
  if (coord) return coord;

  // mapbox first
  let result = await geocodeWithMapbox(candidate);
  if (!result) {
    result = await geocodeWithNominatim(candidate);
    if (result) result.provider = result.provider || 'nominatim';
  }
  if (result) {
    result.variant = candidate;
  }
  return result;
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

// -------------------- Public Geocode API (exports) --------------------
module.exports.getAddressCordinate = async (address) => {
  const { best } = await geocodeWithVariants(address);
  if (!best) throw new Error(`Geocode not found for "${address}"`);
  return best;
};

// -------------------- Distance & Time --------------------
module.exports.getDistanceTime = async (originName, destinationName, profile = 'driving') => {
  if (!originName || !destinationName) throw new Error('Address required');

  // Build geocode variants (do not stop at first success; we will try combinations if routing fails)
  const originCandidates = buildCandidateStrings(originName);
  const destCandidates = buildCandidateStrings(destinationName);

  // Geocode all origin variants until found first; store list (stop at first per variant)
  async function geocodeAll(list) {
    const results = [];
    for (const c of list) {
      const r = await geocodeSingle(c);
      if (r) {
        r.original_query = list[0];
        results.push(r);
      }
    }
    return results;
  }

  const originGeos = await geocodeAll(originCandidates);
  const destGeos = await geocodeAll(destCandidates);

  if (!originGeos.length) throw new Error(`Geocode not found for "${originName}"`);
  if (!destGeos.length) throw new Error(`Geocode not found for "${destinationName}"`);

  const allowedProfiles = new Set(['driving', 'driving-traffic', 'walking', 'cycling']);
  if (!allowedProfiles.has(profile)) profile = 'driving';

  async function routeMapbox(o, d) {
    if (!process.env.MAPBOX_API_KEY) throw new Error('Mapbox disabled');
    const originCoord = `${o.longitude},${o.latitude}`;
    const destCoord = `${d.longitude},${d.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${encodeURIComponent(originCoord)};${encodeURIComponent(destCoord)}`;
    const { data } = await axios.get(url, {
      params: {
        access_token: process.env.MAPBOX_API_KEY,
        alternatives: false,
        geometries: 'geojson',
        overview: 'simplified',
        steps: false
      },
      validateStatus: s => s < 500
    });
    if (data.message) throw new Error(`Mapbox error: ${data.message}`);
    if (!data.routes?.length) throw new Error('Mapbox no route');
    return buildDistanceResponse('mapbox', data.routes[0], o, d);
  }

  async function routeOSRM(o, d) {
    const originCoord = `${o.longitude},${o.latitude}`;
    const destCoord = `${d.longitude},${d.latitude}`;
    const base = 'https://router.project-osrm.org/route/v1/driving/';
    const { data } = await axios.get(
      base + `${encodeURIComponent(originCoord)};${encodeURIComponent(destCoord)}`,
      {
        params: { alternatives: false, steps: false, overview: 'simplified' },
        validateStatus: s => s < 500
      }
    );
    if (data.code && data.code !== 'Ok') throw new Error(`OSRM error: ${data.code}`);
    if (!data.routes?.length) throw new Error('OSRM no route');
    return buildDistanceResponse('osrm', data.routes[0], o, d);
  }

  // Try combinations in priority order
  const triedPairs = [];
  let lastError = null;

  for (const o of originGeos) {
    for (const d of destGeos) {
      const pairKey = `${o.variant} -> ${d.variant}`;
      triedPairs.push(pairKey);
      try {
        if (process.env.MAPBOX_API_KEY) {
          try {
            return await routeMapbox(o, d);
          } catch (mapErr) {
            if (/Mapbox no route|Mapbox error/.test(mapErr.message)) {
              // fallback OSRM
              const osrmRes = await routeOSRM(o, d);
              osrmRes.provider = 'mapbox-fallback-osrm';
              return osrmRes;
            }
            throw mapErr;
          }
        } else {
          return await routeOSRM(o, d);
        }
      } catch (err) {
        lastError = err;
        if (process.env.DEBUG_MAP) {
          console.warn(`[RouteFail] ${pairKey}: ${err.message}`);
        }
        // continue trying other combinations
      }
    }
  }

  const errMsg = lastError
    ? `Route not found between "${originName}" and "${destinationName}": ${lastError.message}`
    : `Route not found between "${originName}" and "${destinationName}"`;
  if (process.env.DEBUG_MAP) {
    console.warn('[RouteAttempts]', triedPairs);
  }
  throw new Error(errMsg);
};

// -------------------- Response Builder --------------------
// ...existing code...
function buildDistanceResponse(provider, route, originGeo, destGeo) {
  const totalSeconds = route.duration;
  const totalMinutes = Math.round(totalSeconds / 60);      // nearest minute
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

    // Single duration field in hours format (e.g. "2h 24m")
    duration: human
  };
}
// ...existing code...