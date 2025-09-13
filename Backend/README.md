#  Backend API Documentation

## Endpoint: `/user/register`

### Description
This endpoint is used to register a new user in the system.

### Method
`POST`

### Request Body
The following fields are required in the request body:
- `fullname.firstname` (string, required): The first name of the user. Must be at least 3 characters long.
- `fullname.lastname` (string, optional): The last name of the user.
- `email` (string, required): The email address of the user. Must be a valid email format.
- `password` (string, required): The password for the user. Must be at least 6 characters long.

Example JSON:
```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "securepassword"
}
```

### Response

#### Success (201)
- **Description**: User registered successfully.
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "id": "user_id",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com"
    },
    "token": "jwt_token"
  }
  ```

#### Validation Error (400)
- **Description**: Validation failed for the input data.
- **Response Body**:
  ```json
  {
    "errors": [
      {
        "msg": "Invalid Email",
        "param": "email",
        "location": "body"
      }
    ]
  }
  ```

### Notes
- Ensure that the `email` field is unique.
- Passwords are hashed before being stored in the database.
- A JWT token is returned upon successful registration.

## Endpoint: `/user/login`

### Description
This endpoint is used to authenticate a user and provide a JWT token for subsequent requests.

### Method
`POST`

### Request Body
The following fields are required in the request body:
- `email` (string, required): The email address of the user. Must be a valid email format.
- `password` (string, required): The password for the user.

Example JSON:
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword"
}
```

### Response

#### Success (200)
- **Description**: User authenticated successfully.
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "user": {
      "id": "user_id",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com"
    },
    "token": "jwt_token"
  }
  ```

#### Authentication Error (401)
- **Description**: Invalid email or password.
- **Response Body**:
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

### Notes
- Ensure that the `email` exists in the database.
- Passwords are verified against the hashed version stored in the database.
- A JWT token is returned upon successful authentication.

## Captain Overview

A **Captain** represents a driver in the Uber Clone platform.  
Captains manage ride requests, have personal profiles and vehicle details.  
They must register and authenticate to access protected captain routes.

## Endpoint: `/captain/register`

### Method
`POST`

### Request Body
- `fullname.firstname` (string, required): First name, min 3 characters.  
- `fullname.lastname` (string, optional): Last name, min 3 characters.  
- `email` (string, required): Valid email format.  
- `password` (string, required): Min 6 characters.  
- `vehicle.color` (string, required): Min 3 characters.  
- `vehicle.plate` (string, required): Min 3 characters.  
- `vehicle.capacity` (number, required): Min 1.  
- `vehicle.vehicleType` (string, required): One of `car`, `motorcycle`, `auto`.  

#### Success (201)
```json
{
  "success": true,
  "message": "Captain registered successfully",
  "captain": {
    "id": "captain_id",
    "fullname": {
      "firstname": "Jane",
      "lastname": "Doe"
    },
    "email": "jane.doe@example.com",
    "vehicle": {
      "color": "Blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    }
  },
  "token": "jwt_token"
}
```

#### Validation Error (400)
```json
{
  "errors": [
    {
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## Endpoint: `/captain/login`

### Method
`POST`

### Request Body
- `email` (string, required): Valid email format.  
- `password` (string, required): Min 6 characters.  

#### Success (200)
```json
{
  "success": true,
  "message": "Captain logged in successfully",
  "captain": {
    "id": "captain_id",
    "fullname": {
      "firstname": "Jane",
      "lastname": "Doe"
    },
    "email": "jane.doe@example.com",
    "vehicle": {
      "color": "Blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    }
  },
  "token": "jwt_token"
}
```

#### Authentication Error (401)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## Map / Geocoding & Routing API

### 1. GET /api/map/geocode
Resolve a free‑form address (or raw coordinates) to latitude/longitude.

Query Parameters:
- address (string, required) Free text. Examples: Bhubaneswar, Station Square, 20.2961,85.8245, 20.29 85.82

Behavior:
1. Attempts to parse raw "lat,lon" (or "lat lon") first (tolerant; auto-detect order if possible).
2. Generates candidate variants if the input is a bare place name:
   - {input}
   - {input}, {DEFAULT_STATE_COUNTRY} (env or "Odisha, India")
   - {input}, {DEFAULT_COUNTRY} (env or "India")
3. For each candidate (first success wins):
   - Try Mapbox (if MAPBOX_API_KEY set)
   - Fallback to Nominatim (OpenStreetMap)
4. Returns first successful geocode.

Example Request:
curl -G "http://localhost:3000/api/map/geocode" --data-urlencode "address=Bhubaneswar"

Success Response (200):
```json
{
  "success": true,
  "data": {
    "provider": "mapbox",
    "address": "Bhubaneswar, Odisha, India",
    "latitude": 20.296058,
    "longitude": 85.82454
  }
}
```

If raw coordinates supplied:
curl -G "http://localhost:3000/api/map/geocode" --data-urlencode "address=20.2961,85.8245"

Possible Error (400/404/500):
```json
{
  "success": false,
  "message": "Geocode not found for \"Some Unknown Place\""
}
```

### 2. GET /api/map/get-distance-time
Compute route distance & estimated duration between two textual locations.

Query Parameters:
- origin (string, required)
- destination (string, required)
- profile (string, optional) One of driving, driving-traffic, walking, cycling (invalid values auto-fallback to driving)

Process:
1. Geocodes origin and destination independently (variant expansion same as /geocode).
2. Builds candidate coordinate pairs.
3. Routing priority:
   - If MAPBOX_API_KEY present: Mapbox Directions first.
     - If Mapbox returns “no route” / error → fallback OSRM public server.
   - Else: OSRM directly.
4. First successful route returns immediately.
5. Distance returned in meters & km; duration formatted (e.g. "2h 5m").

Example Request:
curl -G "http://localhost:5000/api/map/get-distance-time" \
  --data-urlencode "origin=Bhubaneswar Railway Station" \
  --data-urlencode "destination=KIIT University" \
  --data-urlencode "profile=driving"

Success Response (200):
```json
{
  "provider": "mapbox",
  "origin": {
    "query": "Bhubaneswar Railway Station",
    "used_variant": "Bhubaneswar Railway Station, Odisha, India",
    "name": "Bhubaneswar Railway Station, Odisha, India",
    "latitude": 20.2701,
    "longitude": 85.8436
  },
  "destination": {
    "query": "KIIT University",
    "used_variant": "KIIT University, Odisha, India",
    "name": "KIIT University, Odisha, India",
    "latitude": 20.3553,
    "longitude": 85.8193
  },
  "distance_meters": 12450,
  "distance_km": 12.45,
  "duration": "0h 28m"
}
```

Error Response (404/500 example):
```json
{
  "success": false,
  "message": "Route not found between \"X\" and \"Y\": Mapbox no route"
}
```

### 3. GET /api/map/location-suggestion
Provide autocomplete style location suggestions constrained to Odisha, India.

Query Parameters:
- input (string, required) Minimum 2 characters.

Behavior:
1. If MAPBOX_API_KEY is set:
   - Calls Mapbox forward geocoding with autocomplete + bbox restricted to Odisha.
   - Filters results to those whose coordinates fall inside Odisha OR whose context mentions Odisha (Odisha / IN-OD).
2. If Mapbox unavailable/fails:
   - Falls back to Nominatim (OpenStreetMap) with a bounded viewbox of Odisha.
3. Returns normalized list of suggestions (up to limit).
4. Default limit = 5 (override via MAPBOX_SUGGEST_LIMIT env).

Environment Variables Impacting This Endpoint:
- MAPBOX_API_KEY (enables Mapbox & prioritizes it)
- MAPBOX_SUGGEST_LIMIT (default "5")
- ODISHA_BBOX (default "81.4,17.6,87.6,22.8" => minLon,minLat,maxLon,maxLat)

Example Request:
curl -G "http://localhost:3000/api/map/location-suggestion" --data-urlencode "input=bhuba"

Success Response (200) Mapbox example:
```json
{
  "success": true,
  "data": {
    "query": "bhuba",
    "region": "Odisha, India",
    "suggestions": [
      {
        "id": "place.12345",
        "name": "Bhubaneswar",
        "full_address": "Bhubaneswar, Odisha, India",
        "latitude": 20.296058,
        "longitude": 85.82454,
        "types": ["place"],
        "provider": "mapbox"
      }
    ]
  }
}
```

Fallback Nominatim example:
```json
{
  "success": true,
  "data": {
    "query": "bhuba",
    "region": "Odisha, India",
    "suggestions": [
      {
        "id": 987654321,
        "name": "Bhubaneswar",
        "full_address": "Bhubaneswar, Khordha, Odisha, India",
        "latitude": 20.296058,
        "longitude": 85.82454,
        "types": ["city"],
        "provider": "nominatim"
      }
    ]
  }
}
```

Validation Error (400) example (too short):
```json
{
  "success": false,
  "message": "input too short"
}
```

Empty Suggestions (Mapbox & Nominatim both yield none):
```json
{
  "success": true,
  "data": {
    "query": "zzzzunknown",
    "region": "Odisha, India",
    "suggestions": []
  }
}
```

Notes:
- Results are always filtered to Odisha—entries outside state bounds are discarded.
- Use client-side debouncing (≥300ms) to avoid excessive requests.
- For production: add caching (e.g., in-memory LRU or Redis) keyed by (provider,input).

---

### Service Logic (services/map.service.js)

Core Functions & Flow:
1. tryParseCoordinates(input)
   - Detects raw numeric coordinate input (supports "lat,lon", "lon,lat", space/comma separated).
   - Heuristics: values within [-90,90] assumed latitude; disambiguation fallback assumes (lon,lat).
2. buildCandidateStrings(original)
   - If input is a “bare name” (letters & spaces, no comma), generates enriched variants adding DEFAULT_STATE_COUNTRY and DEFAULT_COUNTRY.
   - Env: DEFAULT_STATE_COUNTRY (default "Odisha, India"), DEFAULT_COUNTRY (default "India").
3. geocodeWithMapbox(address)
   - Uses Mapbox forward geocoding if MAPBOX_API_KEY present.
   - Returns first feature (center coords, place_name) or null.
4. geocodeWithNominatim(address)
   - Public OpenStreetMap search, adds User-Agent header.
   - Returns first match or null.
5. geocodeSingle(candidate)
   - Tries raw coordinate parse → Mapbox → Nominatim.
   - Attaches variant used.
6. geocodeWithVariants(originalInput)
   - Iterates candidate list; returns immediately on first success (best).
7. getAddressCordinate(address)
   - Public export. Returns best geocode or throws if none found.
8. getDistanceTime(originName, destinationName, profile)
   - Geocodes both sides (collects all successful variants).
   - Iterates Cartesian product of origin/destination variants.
   - Routing:
     a. routeMapbox(): Mapbox Directions API (geojson, simplified).
     b. routeOSRM(): Public OSRM (driving only).
     c. On Mapbox “no route” → fallback OSRM.
   - First successful route returned; else aggregated error.
9. buildDistanceResponse(provider, route, originGeo, destGeo)
   - Computes km, formats duration as "Hh Mm".
10. Environment Variables:
    - MAPBOX_API_KEY: Enables Mapbox geocoding + routing priority.
    - DEFAULT_STATE_COUNTRY / DEFAULT_COUNTRY: Variant expansion.
    - DEBUG_MAP: If set (any truthy), logs failed routing attempts.
11. Fallback Strategy:
    - Geocoding: Mapbox → Nominatim.
    - Routing: Mapbox → OSRM (if Mapbox fails) OR OSRM alone (no key).
12. Error Handling:
    - Early validation (missing address / not found).
    - Normalized error messages for upstream controller.
13. Extensibility:
    - Additional providers can be inserted into geocodeSingle.
    - Caching layer (e.g. LRU) can wrap geocodeWithVariants / route calls without modifying external API.

Example Geocode Failure Handling:
Input: "XyzNonexistentPlace"
Candidates tried:
[
 "XyzNonexistentPlace",
 "XyzNonexistentPlace, Odisha, India",
 "XyzNonexistentPlace, India"
]
All fail → Error thrown: Geocode not found for "XyzNonexistentPlace"

Example Distance Failure:
If all origin/destination variant pairings fail routing:
Error: Route not found between "A" and "B": <last provider error>

Notes:
- Public OSRM has rate limits; for production deploy your own router.
- Nominatim usage should be rate-limited & cached (policy compliance).
- Consider adding request-level caching for repeated addresses.

---

## Ride Booking API

### 1. POST /rides/create
Create (initiate) a new ride request. Requires authenticated user (JWT).  
Mounted under /rides in app.js → full path: /rides/create

Authentication:
- Requires valid user session (middleware: authUser).
- Token typically sent via Authorization: Bearer <jwt> or httpOnly cookie (depending on implementation).
- 401 returned if missing/invalid.

Request Body Fields:
- pickup (string, required, min 3) Human readable location inside Odisha (same geocoding constraints as map APIs).
- destination (string, required, min 3) Human readable location inside Odisha.
- vehicleType (string, required) One of: auto, car, motorcycle, moto
  - motorcycle is internally normalized to moto.
- otp (string, optional) Ignored for creation. Server generates a 6‑digit OTP automatically. (Do not supply from client.)

Validation Rules:
- pickup / destination must be strings length ≥ 3.
- vehicleType must be in allowed set.
- Under the hood the service geocodes both addresses and rejects if they are outside Odisha or unrealistically far (> ~300km straight‑line).

Fare Calculation:
Let:
- distanceKm = route distance (meters / 1000) computed via getDistanceTime (Mapbox → OSRM fallback).
- durationMinutes = route duration_seconds / 60.

Rates (per vehicle):
- Base Fare: auto 30, car 50, moto 20
- Per Km:    auto 10, car 15, moto 8
- Per Minute:auto 2,  car 3,  moto 1.5

Formula (rounded to nearest integer):
fare = round( baseFare[type] + distanceKm * perKmRate[type] + durationMinutes * perMinuteRate[type] )

Returned Fields (success):
- _id Ride id
- user User id (creator)
- pickup
- destination
- fare (number)
- fare_formatted (string, INR formatted)
- distance_meters
- distance_km
- duration_seconds
- duration_text (e.g. "0h 28m")
- status (initially "pending")
- otp (6 digit string; included only on initial creation response for verification flow)

Example Request (curl):
curl -X POST http://localhost:3000/rides/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "pickup": "Bhubaneswar Railway Station",
    "destination": "KIIT University",
    "vehicleType": "car"
  }'

Example Success (201):
```json
{
  "success": true,
  "ride": {
    "_id": "6730e2c9f1b8c9c4a8ef1234",
    "user": "672fffa9a3c6e2d7e91a5678",
    "pickup": "Bhubaneswar Railway Station",
    "destination": "KIIT University",
    "fare": 182,
    "fare_formatted": "₹182",
    "distance_meters": 12450,
    "distance_km": 12.45,
    "duration_seconds": 1680,
    "duration_text": "0h 28m",
    "status": "pending",
    "otp": "593841"
  }
}
```

Validation Error (400):
```json
{
  "errors": [
    { "type": "field", "msg": "pickup too short", "path": "pickup", "location": "body" }
  ]
}
```

Unauthorized (401 example):
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

Geocode / Region Error (400):
```json
{
  "success": false,
  "message": "No Odisha location found for \"Some Far Place\""
}
```

Routing Error (400/500):
```json
{
  "success": false,
  "message": "No route found between the locations"
}
```

Notes:
- OTP is server-generated; keep it confidential (used later for starting/confirming ride flow—future endpoints).
- Distance & duration rely on Mapbox first if MAPBOX_API_KEY is configured; else OSRM.
- If either pickup or destination cannot be geocoded inside Odisha bounds the request fails.
- Fare is static at creation; later surge / adjustments would require additional logic.
- For idempotency (avoid duplicate rapid requests) the client should disable the button until response.

Potential Future Extensions (not implemented yet):
- PATCH /rides/:id/accept (captain side)
- POST /rides/:id/start (OTP verification)
- POST /rides/:id/complete
- Cancellation endpoints & penalty logic

---
