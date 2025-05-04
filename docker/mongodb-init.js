// MongoDB initialization script
// This script initializes the replica set and creates the necessary users and collections

// Initialize replica set
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb:27017" }
  ]
});

// Wait for the replica set to initialize
sleep(2000);

// Switch to admin database
db = db.getSiblingDB('admin');

// Create admin user
db.createUser({
  user: 'admin',
  pwd: 'admin_password',  // This should be replaced with a secure password in production
  roles: [{ role: 'root', db: 'admin' }]
});

// Switch to BMTC MCP database
db = db.getSiblingDB('bmtc-mcp');

// Create application user
db.createUser({
  user: 'bmtc-app',
  pwd: 'bmtc-app-password',  // This should be replaced with a secure password in production
  roles: [{ role: 'readWrite', db: 'bmtc-mcp' }]
});

// Create initial collections
db.createCollection('buses');
db.createCollection('routes');
db.createCollection('stops');
db.createCollection('busLocations');
db.createCollection('developers');

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

// Create indexes
db.stops.createIndex({ "location": "2dsphere" });
db.busLocations.createIndex({ "location": "2dsphere" });
db.busLocations.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 86400 });

// Switch to BMTC schedule database
db = db.getSiblingDB('bmtc-schedule');

// Create schedule collections
db.createCollection('schedules');

// Print success message
print('MongoDB initialization completed successfully');
