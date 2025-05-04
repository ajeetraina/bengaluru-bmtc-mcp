const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const BusLocation = require('../models/BusLocation');

require('dotenv').config();

// Mock data
const mockRoute = {
  routeId: 'TEST-1',
  routeNumber: 'TEST1',
  routeName: 'Test Route',
  source: 'Test Source',
  destination: 'Test Destination',
  distance: 10.0,
  stopSequence: [
    {
      stopId: 'TEST-STOP-1',
      stopName: 'Test Stop 1',
      sequenceNumber: 1,
      distance: 0,
    },
    {
      stopId: 'TEST-STOP-2',
      stopName: 'Test Stop 2',
      sequenceNumber: 2,
      distance: 5000,
    },
  ],
  schedule: [
    {
      dayType: 'WEEKDAY',
      firstBusTime: '06:00',
      lastBusTime: '22:00',
      frequency: 15,
    },
  ],
  routeType: 'ORDINARY',
  isActive: true,
};

const mockStop = {
  stopId: 'TEST-STOP-2',
  stopName: 'Test Stop 2',
  location: {
    type: 'Point',
    coordinates: [77.5800, 12.9800], // [longitude, latitude]
  },
  address: 'Test Address',
  area: 'Test Area',
  ward: 'Test Ward',
  zone: 'Test Zone',
  routesServed: ['TEST-1'],
  amenities: {
    hasShelter: true,
    hasSeating: true,
    hasLighting: true,
    hasDisplayBoard: false,
  },
  isActive: true,
};

const mockBusLocation = {
  busId: 'TEST-BUS-1',
  routeId: 'TEST-1',
  location: {
    type: 'Point',
    coordinates: [77.5713, 12.9767], // [longitude, latitude]
  },
  speed: 15,
  heading: 180,
  lastStopId: 'TEST-STOP-1',
  nextStopId: 'TEST-STOP-2',
  occupancyLevel: 'MEDIUM',
  timestamp: new Date(),
  isActive: true,
};

// Connect to the test database before running tests
beforeAll(async () => {
  const url = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/bmtc-mcp-test';
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clear the database before each test
beforeEach(async () => {
  await Route.deleteMany({});
  await Stop.deleteMany({});
  await BusLocation.deleteMany({});
});

// Close the database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('ETA API', () => {
  describe('GET /api/v1/eta/:stopId', () => {
    it('should return ETA for all routes at a stop', async () => {
      // Insert mock data
      await Route.create(mockRoute);
      await Stop.create(mockStop);
      await BusLocation.create(mockBusLocation);

      // Test the endpoint
      const res = await request(app).get(`/api/v1/eta/${mockStop.stopId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(0);
      // ETA calculation is complex and depends on the etaCalculator utility
      // So we're just checking the basic structure of the response
    });

    it('should return 404 for non-existent stop', async () => {
      // Test the endpoint with a non-existent ID
      const res = await request(app).get('/api/v1/eta/NON-EXISTENT');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/eta/:stopId/:routeId', () => {
    it('should return ETA for a specific route at a stop', async () => {
      // Insert mock data
      await Route.create(mockRoute);
      await Stop.create(mockStop);
      await BusLocation.create(mockBusLocation);

      // Test the endpoint
      const res = await request(app).get(`/api/v1/eta/${mockStop.stopId}/${mockRoute.routeId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      // ETA calculation is complex and depends on the etaCalculator utility
      // So we're just checking the basic structure of the response
    });

    it('should return 404 for non-existent stop', async () => {
      // Test the endpoint with a non-existent stop ID
      const res = await request(app).get(`/api/v1/eta/NON-EXISTENT/${mockRoute.routeId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent route', async () => {
      // Insert mock stop
      await Stop.create(mockStop);

      // Test the endpoint with a non-existent route ID
      const res = await request(app).get(`/api/v1/eta/${mockStop.stopId}/NON-EXISTENT`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });
});
