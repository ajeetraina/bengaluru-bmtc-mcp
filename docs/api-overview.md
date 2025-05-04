# BMTC MCP API Overview

This document provides an overview of the BMTC Mobility Connectivity Platform (MCP) API.

## API Basics

### Base URL

The base URL for the API is:

- Production: `https://api.mybmtc.karnataka.gov.in/v1`
- Development: `https://api-dev.mybmtc.karnataka.gov.in/v1`
- Local Development: `http://localhost:3000/api/v1`

### Authentication

All API endpoints (except the health check) require authentication via API keys. API keys should be included in the request header as follows:

```
x-api-key: YOUR_API_KEY
```

### Rate Limiting

API requests are rate-limited to prevent abuse. The limits vary by tier:

- FREE tier: 1,000 requests per day
- BASIC tier: 10,000 requests per day
- PREMIUM tier: 100,000 requests per day

### Response Format

All API responses are in JSON format and follow a consistent structure:

- Success responses contain the requested data
- Error responses contain an error object with a message

### HTTP Status Codes

- 200 OK: Request succeeded
- 400 Bad Request: The request was invalid
- 401 Unauthorized: API key is missing or invalid
- 404 Not Found: The requested resource was not found
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: An error occurred on the server

## API Endpoints

### Health Check

```
GET /health
```

Checks the health of the API server. This endpoint does not require authentication.

### Bus Routes

```
GET /bus-routes
```

Returns a list of all BMTC bus routes.

```
GET /bus-routes/{routeId}
```

Returns detailed information about a specific bus route, including all stops.

### Bus Stops

```
GET /bus-stops
```

Returns a list of all BMTC bus stops with pagination. Optional query parameters include:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 100, max: 100)
- `lat`, `lng`, `radius`: For searching nearby stops

### Bus Arrivals

```
GET /bus-arrivals/{stopId}
```

Returns estimated arrival times for buses at a specific stop.

### Bus Locations

```
GET /bus-locations/{routeId}
```

Returns the current locations of all buses on a specific route.

### Service Alerts

```
GET /service-alerts
```

Returns active service alerts such as delays, detours, and other disruptions.

### Fare Calculator

```
GET /fare-calculator
```

Calculates fare options for travel between specified stops. Required query parameters:
- `fromStopId`: Origin stop ID
- `toStopId`: Destination stop ID

Optional query parameters:
- `routeId`: Specific route ID
- `busType`: Bus type (REGULAR, AC, ELECTRIC, METRO_FEEDER)

### GTFS Feeds

```
GET /gtfs-rt/vehicle-positions
```

Returns a GTFS-RT feed of vehicle positions in Protocol Buffer format.

```
GET /gtfs-rt/trip-updates
```

Returns a GTFS-RT feed of trip updates in Protocol Buffer format.

```
GET /gtfs-rt/service-alerts
```

Returns a GTFS-RT feed of service alerts in Protocol Buffer format.

## Using the API

### Example: Getting Bus Arrivals

Request:
```bash
curl -H "x-api-key: YOUR_API_KEY" https://api.mybmtc.karnataka.gov.in/v1/bus-arrivals/KBS-01
```

Response:
```json
{
  "stopId": "KBS-01",
  "stopName": "Kempegowda Bus Station Platform 1",
  "arrivals": [
    {
      "routeId": "500K",
      "routeName": "Kempegowda Bus Station to Kadugodi",
      "destination": "Kadugodi",
      "vehicleId": "KA-01-F-1234",
      "estimatedArrival": "2025-05-04T12:45:00.000Z",
      "eta": 5,
      "busType": "REGULAR",
      "isAccessible": true
    },
    {
      "routeId": "501A",
      "routeName": "Kempegowda Bus Station to Airport",
      "destination": "Airport",
      "vehicleId": "KA-01-F-5678",
      "estimatedArrival": "2025-05-04T12:50:00.000Z",
      "eta": 10,
      "busType": "AC",
      "isAccessible": true
    }
  ],
  "lastUpdated": "2025-05-04T12:40:00.000Z"
}
```

## GTFS and GTFS-RT

The API provides GTFS and GTFS-RT feeds for interoperability with other transit applications. GTFS-RT feeds are available in Protocol Buffer format, which is the standard format for GTFS-RT. These feeds can be consumed by any application that understands the GTFS-RT specification.

## Error Handling

When an error occurs, the API returns an error response with a descriptive message. Example:

```json
{
  "error": "Route not found"
}
```

## API Documentation

Full API documentation is available at `/api/docs` when running the server. This Swagger UI interface provides comprehensive documentation of all available endpoints, request parameters, and response formats.
