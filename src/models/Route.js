const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    routeId: {
      type: String,
      required: true,
      unique: true,
    },
    routeNumber: {
      type: String,
      required: true,
    },
    routeName: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    stopSequence: [
      {
        stopId: {
          type: String,
          required: true,
        },
        stopName: {
          type: String,
          required: true,
        },
        sequenceNumber: {
          type: Number,
          required: true,
        },
        distance: {
          type: Number,
          required: true,
        },
      },
    ],
    schedule: [
      {
        dayType: {
          type: String,
          enum: ['WEEKDAY', 'SATURDAY', 'SUNDAY', 'HOLIDAY'],
          required: true,
        },
        firstBusTime: {
          type: String,
          required: true,
        },
        lastBusTime: {
          type: String,
          required: true,
        },
        frequency: {
          type: Number, // in minutes
          required: true,
        },
      },
    ],
    routeType: {
      type: String,
      enum: ['ORDINARY', 'VOLVO', 'AC', 'NON_AC', 'VAJRA', 'BIG10'],
      required: true,
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

module.exports = mongoose.model('Route', routeSchema);
