const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    stopId: {
      type: String,
      required: true,
      unique: true,
    },
    stopName: {
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
    address: {
      type: String,
    },
    area: {
      type: String,
    },
    ward: {
      type: String,
    },
    zone: {
      type: String,
    },
    routesServed: [
      {
        type: String, // Route IDs
      },
    ],
    amenities: {
      hasShelter: {
        type: Boolean,
        default: false,
      },
      hasSeating: {
        type: Boolean,
        default: false,
      },
      hasLighting: {
        type: Boolean,
        default: false,
      },
      hasDisplayBoard: {
        type: Boolean,
        default: false,
      },
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
stopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Stop', stopSchema);
