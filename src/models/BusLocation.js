const mongoose = require('mongoose');

const busLocationSchema = new mongoose.Schema(
  {
    busId: {
      type: String,
      required: true,
    },
    routeId: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    speed: {
      type: Number, // in km/h
      default: 0,
    },
    heading: {
      type: Number, // in degrees from north
      default: 0,
    },
    lastStopId: {
      type: String,
    },
    nextStopId: {
      type: String,
    },
    occupancyLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'],
      default: 'MEDIUM',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index
busLocationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('BusLocation', busLocationSchema);
