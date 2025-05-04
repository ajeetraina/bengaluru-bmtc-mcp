/**
 * Test script for BMTC MCP API
 * 
 * This script tests the BMTC MCP API endpoints and prints the results.
 * It can be used with Claude to demonstrate the API functionality.
 */

const axios = require('axios');
const fs = require('fs');

// MCP Server configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-12345';
const OUTPUT_DIR = './api-responses';

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper function to make API requests
async function makeRequest(endpoint, params = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making request to: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'x-api-key': API_KEY
      },
      params
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return null;
  }
}

// Helper function to save response to file
function saveResponse(filename, data) {
  const filePath = `${OUTPUT_DIR}/${filename}`;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Response saved to: ${filePath}`);
}

// Test health endpoint
async function testHealth() {
  console.log('\n=== Testing Health Endpoint ===');
  const data = await makeRequest('/health');
  if (data) {
    console.log('Health Status:', data.status);
    saveResponse('health.json', data);
  }
}

// Test bus routes endpoint
async function testBusRoutes() {
  console.log('\n=== Testing Bus Routes Endpoint ===');
  const data = await makeRequest('/bus-routes');
  if (data) {
    console.log(`Found ${data.length} bus routes`);
    saveResponse('bus-routes.json', data);
  }
}

// Test specific route endpoint
async function testRouteDetails(routeId) {
  console.log(`\n=== Testing Route Details Endpoint for ${routeId} ===`);
  const data = await makeRequest(`/bus-routes/${routeId}`);
  if (data) {
    console.log(`Route: ${data.routeName}`);
    console.log(`From: ${data.origin} to ${data.destination}`);
    console.log(`Number of stops: ${data.stops?.length || 0}`);
    saveResponse(`route-${routeId}.json`, data);
  }
}

// Test bus stops endpoint
async function testBusStops() {
  console.log('\n=== Testing Bus Stops Endpoint ===');
  const data = await makeRequest('/bus-stops');
  if (data) {
    console.log(`Found ${data.stops?.length || 0} bus stops`);
    saveResponse('bus-stops.json', data);
  }
}

// Test bus stops nearby endpoint
async function testNearbyStops(lat, lng, radius) {
  console.log(`\n=== Testing Nearby Stops Endpoint (${lat}, ${lng}, ${radius}km) ===`);
  const data = await makeRequest('/bus-stops', { lat, lng, radius });
  if (data) {
    console.log(`Found ${data.length || 0} nearby stops`);
    saveResponse('nearby-stops.json', data);
  }
}

// Test bus arrivals endpoint
async function testBusArrivals(stopId) {
  console.log(`\n=== Testing Bus Arrivals Endpoint for ${stopId} ===`);
  const data = await makeRequest(`/bus-arrivals/${stopId}`);
  if (data) {
    console.log(`Stop: ${data.stopName}`);
    console.log(`Number of arrivals: ${data.arrivals?.length || 0}`);
    if (data.arrivals && data.arrivals.length > 0) {
      data.arrivals.forEach((arrival, index) => {
        console.log(`${index + 1}. Route ${arrival.routeId} to ${arrival.destination} - ETA: ${arrival.eta} minutes`);
      });
    }
    saveResponse(`arrivals-${stopId}.json`, data);
  }
}

// Test bus locations endpoint
async function testBusLocations(routeId) {
  console.log(`\n=== Testing Bus Locations Endpoint for ${routeId} ===`);
  const data = await makeRequest(`/bus-locations/${routeId}`);
  if (data) {
    console.log(`Route: ${data.routeName}`);
    console.log(`Number of buses: ${data.buses?.length || 0}`);
    saveResponse(`locations-${routeId}.json`, data);
  }
}

// Test service alerts endpoint
async function testServiceAlerts() {
  console.log('\n=== Testing Service Alerts Endpoint ===');
  const data = await makeRequest('/service-alerts');
  if (data) {
    console.log(`Number of alerts: ${data.alerts?.length || 0}`);
    saveResponse('service-alerts.json', data);
  }
}

// Test fare calculator endpoint
async function testFareCalculator(fromStopId, toStopId, busType = 'REGULAR') {
  console.log(`\n=== Testing Fare Calculator Endpoint (${fromStopId} to ${toStopId}, ${busType}) ===`);
  const data = await makeRequest('/fare-calculator', { fromStopId, toStopId, busType });
  if (data) {
    console.log(`Number of fare options: ${data.fareOptions?.length || 0}`);
    if (data.fareOptions && data.fareOptions.length > 0) {
      data.fareOptions.forEach((option, index) => {
        console.log(`${index + 1}. Route ${option.routeId} - ${option.distance}km - ₹${option.fare}`);
      });
    }
    saveResponse(`fare-${fromStopId}-${toStopId}-${busType}.json`, data);
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testHealth();
    await testBusRoutes();
    await testRouteDetails('500K');
    await testRouteDetails('501A');
    await testBusStops();
    await testNearbyStops(12.9783, 77.5719, 5); // Near KBS
    await testBusArrivals('KBS-01');
    await testBusArrivals('KDG-01');
    await testBusLocations('500K');
    await testBusLocations('501A');
    await testServiceAlerts();
    await testFareCalculator('KBS-01', 'KDG-01', 'REGULAR');
    await testFareCalculator('KBS-01', 'APT-01', 'AC');
    
    console.log('\n=== All tests completed ===');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runAllTests();
