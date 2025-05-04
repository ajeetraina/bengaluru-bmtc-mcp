/**
 * Seed script for loading initial data into the database
 * 
 * Usage: node src/scripts/seed.js
 */

require('dotenv').config();

const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { generateMockRoutes, generateMockStops, generateMockBusLocations } = require('../utils/mockData');

// Models
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const BusLocation = require('../models/BusLocation');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bmtc-mcp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Function to seed routes
async function seedRoutes() {
  try {
    // Clear existing data
    await Route.deleteMany({});
    console.log('Routes collection cleared');

    // Generate mock routes
    const routes = generateMockRoutes(20); // Generate 20 routes

    // Insert routes
    await Route.insertMany(routes);
    console.log(`${routes.length} routes inserted successfully`);

    return routes;
  } catch (error) {
    console.error(`Error seeding routes: ${error.message}`);
    throw error;
  }
}

// Function to seed stops
async function seedStops() {
  try {
    // Clear existing data
    await Stop.deleteMany({});
    console.log('Stops collection cleared');

    // Generate mock stops
    const stops = generateMockStops(50); // Generate 50 stops

    // Insert stops
    await Stop.insertMany(stops);
    console.log(`${stops.length} stops inserted successfully`);

    return stops;
  } catch (error) {
    console.error(`Error seeding stops: ${error.message}`);
    throw error;
  }
}

// Function to seed bus locations
async function seedBusLocations() {
  try {
    // Clear existing data
    await BusLocation.deleteMany({});
    console.log('Bus Locations collection cleared');

    // Generate mock bus locations
    const busLocations = generateMockBusLocations(30); // Generate 30 bus locations

    // Insert bus locations
    await BusLocation.insertMany(busLocations);
    console.log(`${busLocations.length} bus locations inserted successfully`);

    return busLocations;
  } catch (error) {
    console.error(`Error seeding bus locations: ${error.message}`);
    throw error;
  }
}

// Function to seed users
async function seedUsers() {
  try {
    // Clear existing data
    await User.deleteMany({});
    console.log('Users collection cleared');

    // Create admin user
    const adminUser = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // In a real app, this would be hashed
      role: 'admin',
      apiKey: 'admin-api-key-123',
    };

    // Create regular user
    const regularUser = {
      name: 'Regular User',
      email: 'user@example.com',
      password: 'user123', // In a real app, this would be hashed
      role: 'user',
      apiKey: 'user-api-key-456',
    };

    // Insert users
    await User.insertMany([adminUser, regularUser]);
    console.log('2 users inserted successfully');

    return [adminUser, regularUser];
  } catch (error) {
    console.error(`Error seeding users: ${error.message}`);
    throw error;
  }
}

// Main function to run all seed operations
async function seedAll() {
  try {
    console.log('Starting seed process...');
    
    // Connect to the database
    await connectDB();
    
    // Seed all collections
    await seedUsers();
    await seedRoutes();
    await seedStops();
    await seedBusLocations();

    console.log('Seed process completed successfully');
    
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error(`Seed process failed: ${error.message}`);
    
    // Close the database connection
    if (mongoose.connection) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
    
    process.exit(1);
  }
}

// Run the seed process
seedAll();
