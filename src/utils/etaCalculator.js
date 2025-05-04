/**
 * Calculate estimated time of arrival in minutes
 * @param {Object} bus The bus location object
 * @param {Array} stopSequence Array of stops from current stop to target stop
 * @returns {Number} ETA in minutes
 */
const calculateETA = (bus, stopSequence) => {
  // Default speed if not available in the bus object
  const speedKmh = bus.speed || 15; // 15 km/h as default speed if not available
  
  // Calculate total distance in meters
  let totalDistance = 0;
  for (let i = 0; i < stopSequence.length - 1; i++) {
    totalDistance += stopSequence[i + 1].distance;
  }
  
  // Calculate travel time in minutes
  // Speed is in km/h, distance is in meters
  // Convert to consistent units: km and hours
  const distanceKm = totalDistance / 1000;
  const timeHours = distanceKm / speedKmh;
  const timeMinutes = timeHours * 60;
  
  // Add some buffer for stops, traffic, etc.
  const buffer = stopSequence.length * 0.5; // 30 seconds per stop
  
  return Math.ceil(timeMinutes + buffer);
};

module.exports = {
  calculateETA,
};
