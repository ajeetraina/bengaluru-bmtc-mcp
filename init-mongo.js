// Setup test data in MongoDB
db = db.getSiblingDB('bmtc-mcp');

// Create collections
db.createCollection('buses');
db.createCollection('routes');
db.createCollection('stops');
db.createCollection('busLocations');
db.createCollection('developers');

// Create indexes
db.stops.createIndex({ "location": "2dsphere" });
db.busLocations.createIndex({ "location": "2dsphere" });
db.busLocations.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 86400 });

// Create a test developer for API access
db.developers.insertOne({
  name: "Test Developer",
  email: "test@example.com",
  organization: "Test Organization",
  apiKey: "test-api-key-12345",
  tier: "FREE",
  rateLimit: 1000,
  isActive: true,
  createdAt: new Date()
});

// Add some test bus stops
db.stops.insertMany([
  {
    stopId: "KBS-01",
    stopName: "Kempegowda Bus Station Platform 1",
    location: {
      type: "Point",
      coordinates: [77.5719, 12.9783]
    },
    address: "Kempegowda Bus Station, Majestic, Bangalore",
    amenities: {
      hasShelter: true,
      hasSeating: true,
      hasDisplayBoard: true,
      isAccessible: true
    },
    routes: ["500K", "501A"]
  },
  {
    stopId: "KDG-01",
    stopName: "Kadugodi Bus Station",
    location: {
      type: "Point",
      coordinates: [77.7641, 12.9986]
    },
    address: "Kadugodi Bus Station, Bangalore",
    amenities: {
      hasShelter: true,
      hasSeating: true,
      hasDisplayBoard: false,
      isAccessible: true
    },
    routes: ["500K"]
  },
  {
    stopId: "APT-01",
    stopName: "Kempegowda International Airport",
    location: {
      type: "Point",
      coordinates: [77.7060, 13.1989]
    },
    address: "Kempegowda International Airport, Bangalore",
    amenities: {
      hasShelter: true,
      hasSeating: true,
      hasDisplayBoard: true,
      isAccessible: true
    },
    routes: ["501A"]
  }
]);

// Add some test bus routes
db.routes.insertMany([
  {
    routeId: "500K",
    routeName: "Kempegowda Bus Station to Kadugodi",
    origin: "Kempegowda Bus Station",
    destination: "Kadugodi",
    distance: 23.5,
    frequency: 15,
    stops: [
      {
        stopId: "KBS-01",
        stopName: "Kempegowda Bus Station Platform 1",
        sequenceNumber: 1,
        distanceFromOrigin: 0,
        expectedTravelTime: 0
      },
      {
        stopId: "KDG-01",
        stopName: "Kadugodi Bus Station",
        sequenceNumber: 2,
        distanceFromOrigin: 23.5,
        expectedTravelTime: 90
      }
    ]
  },
  {
    routeId: "501A",
    routeName: "Kempegowda Bus Station to Airport",
    origin: "Kempegowda Bus Station",
    destination: "Kempegowda International Airport",
    distance: 35.0,
    frequency: 30,
    stops: [
      {
        stopId: "KBS-01",
        stopName: "Kempegowda Bus Station Platform 1",
        sequenceNumber: 1,
        distanceFromOrigin: 0,
        expectedTravelTime: 0
      },
      {
        stopId: "APT-01",
        stopName: "Kempegowda International Airport",
        sequenceNumber: 2,
        distanceFromOrigin: 35.0,
        expectedTravelTime: 120
      }
    ]
  }
]);

// Add some test buses
db.buses.insertMany([
  {
    vehicleId: "KA-01-F-1234",
    registrationNumber: "KA-01-F-1234",
    routeId: "500K",
    capacity: 60,
    isActive: true,
    lastServiceDate: new Date("2025-04-15"),
    features: {
      isAC: false,
      isElectric: false,
      hasWifi: false,
      isWheelchairAccessible: true
    }
  },
  {
    vehicleId: "KA-01-F-5678",
    registrationNumber: "KA-01-F-5678",
    routeId: "501A",
    capacity: 45,
    isActive: true,
    lastServiceDate: new Date("2025-04-20"),
    features: {
      isAC: true,
      isElectric: false,
      hasWifi: true,
      isWheelchairAccessible: true
    }
  }
]);

// Add some test bus locations (simulating real-time data)
const now = new Date();
db.busLocations.insertMany([
  {
    vehicleId: "KA-01-F-1234",
    routeId: "500K",
    location: {
      type: "Point",
      coordinates: [77.5719, 12.9783] // At KBS-01
    },
    speed: 0,
    heading: 90,
    timestamp: now,
    nextStopId: "KBS-01",
    delay: 0
  },
  {
    vehicleId: "KA-01-F-5678",
    routeId: "501A",
    location: {
      type: "Point",
      coordinates: [77.5900, 13.0500] // En route to airport
    },
    speed: 40,
    heading: 45,
    timestamp: now,
    nextStopId: "APT-01",
    delay: 5
  }
]);

// Switch to BMTC schedule database
db = db.getSiblingDB('bmtc-schedule');

// Create schedule collections
db.createCollection('schedules');

// Print success message
print('MongoDB initialization completed successfully');
