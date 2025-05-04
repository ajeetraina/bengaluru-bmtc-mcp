/**
 * This file contains mock data generators for development and testing
 */

/**
 * Generate a list of mock routes
 * @param {Number} count Number of routes to generate (default: 5)
 * @returns {Array} Array of route objects
 */
const generateMockRoutes = (count = 5) => {
  const routes = [];

  // Common sources and destinations in Bengaluru
  const sources = [
    'Kempegowda Bus Station',
    'Shivajinagar',
    'Jayanagar',
    'Whitefield',
    'Electronic City',
  ];

  const destinations = [
    'MG Road',
    'Banashankari',
    'Hebbal',
    'Silk Board',
    'Majestic',
  ];

  for (let i = 0; i < count; i++) {
    const sourceIndex = i % sources.length;
    const destIndex = (i + 2) % destinations.length;

    routes.push({
      routeId: `ROUTE-${i + 1}`,
      routeNumber: `${i + 1}${String.fromCharCode(65 + (i % 26))}`,
      routeName: `${sources[sourceIndex]} to ${destinations[destIndex]}`,
      source: sources[sourceIndex],
      destination: destinations[destIndex],
      distance: 5 + Math.random() * 15, // 5 to 20 km
      stopSequence: generateMockStopSequence(5 + (i % 5), sources[sourceIndex], destinations[destIndex]),
      schedule: [
        {
          dayType: 'WEEKDAY',
          firstBusTime: '05:30',
          lastBusTime: '22:30',
          frequency: 10 + (i % 10), // 10 to 19 minutes
        },
        {
          dayType: 'SATURDAY',
          firstBusTime: '06:00',
          lastBusTime: '22:00',
          frequency: 15 + (i % 10), // 15 to 24 minutes
        },
        {
          dayType: 'SUNDAY',
          firstBusTime: '06:30',
          lastBusTime: '21:30',
          frequency: 20 + (i % 10), // 20 to 29 minutes
        },
      ],
      routeType: i % 2 === 0 ? 'ORDINARY' : 'VOLVO',
      isActive: true,
    });
  }

  return routes;
};

/**
 * Generate a mock stop sequence for a route
 * @param {Number} count Number of stops to generate
 * @param {String} source Source name
 * @param {String} destination Destination name
 * @returns {Array} Array of stop sequence objects
 */
const generateMockStopSequence = (count, source, destination) => {
  const stopSequence = [];
  let totalDistance = 0;

  for (let i = 0; i < count; i++) {
    const isSource = i === 0;
    const isDestination = i === count - 1;
    const stopDistance = isSource ? 0 : 500 + Math.random() * 2000; // 500 to 2500 meters between stops
    
    totalDistance += stopDistance;

    stopSequence.push({
      stopId: `STOP-${i + 1}`,
      stopName: isSource ? source : isDestination ? destination : `Stop ${i + 1}`,
      sequenceNumber: i + 1,
      distance: stopDistance,
    });
  }

  return stopSequence;
};

/**
 * Generate a list of mock stops
 * @param {Number} count Number of stops to generate (default: 10)
 * @returns {Array} Array of stop objects
 */
const generateMockStops = (count = 10) => {
  const stops = [];

  // Areas in Bengaluru
  const areas = [
    'Majestic',
    'Indiranagar',
    'Koramangala',
    'Jayanagar',
    'BTM Layout',
    'Whitefield',
    'Marathahalli',
    'JP Nagar',
    'Malleswaram',
    'Rajajinagar',
  ];

  // Base coordinates for Bengaluru
  const baseLatitude = 12.9716;
  const baseLongitude = 77.5946;

  for (let i = 0; i < count; i++) {
    const areaIndex = i % areas.length;

    // Generate random latitude and longitude offsets
    const latOffset = (Math.random() - 0.5) * 0.1; // +/- 0.05 degrees
    const lngOffset = (Math.random() - 0.5) * 0.1; // +/- 0.05 degrees

    stops.push({
      stopId: `STOP-${i + 1}`,
      stopName: `${areas[areaIndex]} Bus Stop ${i + 1}`,
      location: {
        type: 'Point',
        coordinates: [baseLongitude + lngOffset, baseLatitude + latOffset], // [longitude, latitude]
      },
      address: `${i + 1} Main Road, ${areas[areaIndex]}`,
      area: areas[areaIndex],
      ward: `Ward ${1 + (i % 20)}`,
      zone: i % 4 === 0 ? 'North' : i % 4 === 1 ? 'South' : i % 4 === 2 ? 'East' : 'West',
      routesServed: generateRandomRouteIds(2 + (i % 4)), // 2 to 5 routes
      amenities: {
        hasShelter: i % 3 === 0,
        hasSeating: i % 2 === 0,
        hasLighting: i % 4 === 0,
        hasDisplayBoard: i % 5 === 0,
      },
      isActive: true,
    });
  }

  return stops;
};

/**
 * Generate a list of mock bus locations
 * @param {Number} count Number of bus locations to generate (default: 20)
 * @returns {Array} Array of bus location objects
 */
const generateMockBusLocations = (count = 20) => {
  const busLocations = [];

  // Base coordinates for Bengaluru
  const baseLatitude = 12.9716;
  const baseLongitude = 77.5946;

  for (let i = 0; i < count; i++) {
    // Generate random latitude and longitude offsets
    const latOffset = (Math.random() - 0.5) * 0.1; // +/- 0.05 degrees
    const lngOffset = (Math.random() - 0.5) * 0.1; // +/- 0.05 degrees

    const routeId = `ROUTE-${1 + (i % 5)}`; // Routes 1-5

    busLocations.push({
      busId: `KA-57-F-${1000 + i}`,
      routeId,
      location: {
        type: 'Point',
        coordinates: [baseLongitude + lngOffset, baseLatitude + latOffset], // [longitude, latitude]
      },
      speed: 10 + (Math.random() * 30), // 10 to 40 km/h
      heading: Math.floor(Math.random() * 360), // 0 to 359 degrees
      lastStopId: `STOP-${1 + (i % 10)}`,
      nextStopId: `STOP-${1 + ((i + 1) % 10)}`,
      occupancyLevel: i % 4 === 0 ? 'LOW' : i % 4 === 1 ? 'MEDIUM' : i % 4 === 2 ? 'HIGH' : 'VERY_HIGH',
      timestamp: new Date(),
      isActive: true,
    });
  }

  return busLocations;
};

/**
 * Generate random route IDs
 * @param {Number} count Number of route IDs to generate
 * @returns {Array} Array of route IDs
 */
const generateRandomRouteIds = (count) => {
  const routeIds = [];
  for (let i = 0; i < count; i++) {
    routeIds.push(`ROUTE-${1 + (i % 10)}`);
  }
  return routeIds;
};

module.exports = {
  generateMockRoutes,
  generateMockStops,
  generateMockBusLocations,
};
