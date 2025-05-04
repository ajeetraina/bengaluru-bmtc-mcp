const mongoose = require('mongoose');

// Bus Schema
const BusSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true, unique: true },
  registrationNumber: { type: String, required: true },
  routeId: { type: String, required: true },
  capacity: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  lastServiceDate: { type: Date },
  features: {
    isAC: { type: Boolean, default: false },
    isElectric: { type: Boolean, default: false },
    hasWifi: { type: Boolean, default: false },
    isWheelchairAccessible: { type: Boolean, default: false }
  }
});

// Route Schema
const RouteSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true },
  routeName: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  distance: { type: Number, required: true }, // in kilometers
  frequency: { type: Number }, // in minutes
  stops: [{
    stopId: { type: String, required: true },
    stopName: { type: String, required: true },
    sequenceNumber: { type: Number, required: true },
    distanceFromOrigin: { type: Number, required: true }, // in kilometers
    expectedTravelTime: { type: Number, required: true } // in minutes from origin
  }],
  schedule: [{
    dayType: { type: String, enum: ['WEEKDAY', 'SATURDAY', 'SUNDAY', 'HOLIDAY'] },
    trips: [{
      departureTime: { type: String, required: true }, // HH:MM format
      arrivalTime: { type: String, required: true }, // HH:MM format
      busType: { type: String, enum: ['REGULAR', 'AC', 'ELECTRIC', 'METRO_FEEDER'] }
    }]
  }]
});

// Stop Schema
const StopSchema = new mongoose.Schema({
  stopId: { type: String, required: true, unique: true },
  stopName: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  address: { type: String },
  amenities: {
    hasShelter: { type: Boolean, default: false },
    hasSeating: { type: Boolean, default: false },
    hasDisplayBoard: { type: Boolean, default: false },
    isAccessible: { type: Boolean, default: false }
  },
  routes: [{ type: String }] // Array of route IDs serving this stop
});

// Create spatial index for geolocation queries
StopSchema.index({ location: '2dsphere' });

// Bus Location Schema
const BusLocationSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true },
  routeId: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  speed: { type: Number }, // in km/h
  heading: { type: Number }, // in degrees (0-360)
  timestamp: { type: Date, default: Date.now },
  nextStopId: { type: String },
  delay: { type: Number } // in minutes (positive = late, negative = early)
});

// Create spatial index for geolocation queries
BusLocationSchema.index({ location: '2dsphere' });
BusLocationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 }); // TTL index - data expires after 24 hours

// Developer Schema
const DeveloperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  organization: { type: String },
  apiKey: { type: String, required: true, unique: true },
  tier: { type: String, enum: ['FREE', 'BASIC', 'PREMIUM'], default: 'FREE' },
  rateLimit: { type: Number, default: 1000 }, // Requests per day
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Initialize models
const Bus = mongoose.model('Bus', BusSchema);
const Route = mongoose.model('Route', RouteSchema);
const Stop = mongoose.model('Stop', StopSchema);
const BusLocation = mongoose.model('BusLocation', BusLocationSchema);
const Developer = mongoose.model('Developer', DeveloperSchema);

module.exports = {
  Bus,
  Route,
  Stop,
  BusLocation,
  Developer
};
