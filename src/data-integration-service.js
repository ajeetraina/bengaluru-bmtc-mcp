// BMTC Data Integration Service
//
// This service connects to various BMTC data sources and transforms them
// into standardized formats for use in the MCP platform.
//
// Main responsibilities:
// 1. Connect to BMTC GPS/ATD tracking systems
// 2. Fetch and transform schedule data
// 3. Generate GTFS feeds
// 4. Maintain a data lake for analytics

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const schedule = require('node-schedule');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const logger = require('./utils/logger');
const config = require('./config');

// MongoDB models (imported from main server)
const { Bus, Route, Stop, BusLocation } = require('./models');

// Connect to MongoDB
mongoose.connect(config.mongodb.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => logger.info('MongoDB connected'))
.catch(err => logger.error('MongoDB connection error:', err));

// Initialize the data integration service
class BMTCDataIntegrationService {
  constructor() {
    this.isRunning = false;
    this.stats = {
      lastRun: null,
      recordsProcessed: 0,
      errors: 0
    };
  }

  // Start the service with scheduled jobs
  async start() {
    if (this.isRunning) {
      logger.warn('Data integration service is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting BMTC data integration service');

    try {
      // Initialize connections to data sources
      await this.initializeDataSources();

      // Schedule jobs
      this.scheduleJobs();

      // Run initial data import
      await this.performFullDataImport();

      logger.info('BMTC data integration service started successfully');
    } catch (error) {
      logger.error('Failed to start data integration service:', error);
      this.isRunning = false;
      throw error;
    }
  }

  // Initialize connections to various data sources
  async initializeDataSources() {
    logger.info('Initializing connections to data sources');

    // Test connection to BMTC GPS API
    try {
      await axios.get(config.bmtcApi.healthEndpoint, {
        headers: {
          'Authorization': `Bearer ${config.bmtcApi.apiKey}`
        }
      });
      logger.info('Successfully connected to BMTC GPS API');
    } catch (error) {
      logger.error('Failed to connect to BMTC GPS API:', error.message);
      // We'll continue anyway and retry later
    }

    // Test connection to BMTC Schedule Database
    try {
      const client = new MongoClient(config.bmtcScheduleDb.uri);
      await client.connect();
      await client.db().command({ ping: 1 });
      await client.close();
      logger.info('Successfully connected to BMTC Schedule Database');
    } catch (error) {
      logger.error('Failed to connect to BMTC Schedule Database:', error.message);
      // We'll continue anyway and retry later
    }

    // Initialize local data directories
    const dirs = [
      config.dataDirectories.raw,
      config.dataDirectories.processed,
      config.dataDirectories.gtfs,
      config.dataDirectories.logs
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
      }
    }
  }

  // Schedule recurring jobs
  scheduleJobs() {
    logger.info('Setting up scheduled jobs');

    // Fetch GPS data every minute
    schedule.scheduleJob('*/1 * * * *', async () => {
      try {
        await this.fetchRealtimeGpsData();
      } catch (error) {
        logger.error('Error in GPS data fetch job:', error);
        this.stats.errors++;
      }
    });

    // Update schedules daily at 1:00 AM
    schedule.scheduleJob('0 1 * * *', async () => {
      try {
        await this.updateScheduleData();
      } catch (error) {
        logger.error('Error in schedule update job:', error);
        this.stats.errors++;
      }
    });

    // Generate GTFS static feed weekly on Sunday at 2:00 AM
    schedule.scheduleJob('0 2 * * 0', async () => {
      try {
        await this.generateGtfsStaticFeed();
      } catch (error) {
        logger.error('Error in GTFS static feed generation job:', error);
        this.stats.errors++;
      }
    });

    // Clean up old data monthly on the 1st at 3:00 AM
    schedule.scheduleJob('0 3 1 * *', async () => {
      try {
        await this.cleanupOldData();
      } catch (error) {
        logger.error('Error in data cleanup job:', error);
        this.stats.errors++;
      }
    });

    logger.info('All scheduled jobs have been set up');
  }

  // Perform a full data import (typically run on startup)
  async performFullDataImport() {
    logger.info('Starting full data import');

    try {
      // Import static data first
      await this.importStops();
      await this.importRoutes();
      await this.importBuses();
      
      // Then import dynamic data
      await this.fetchRealtimeGpsData();
      
      // Generate initial GTFS feed
      await this.generateGtfsStaticFeed();
      
      this.stats.lastRun = new Date();
      logger.info('Full data import completed successfully');
    } catch (error) {
      logger.error('Error during full data import:', error);
      this.stats.errors++;
      throw error;
    }
  }

  // Import bus stops from BMTC data source
  async importStops() {
    logger.info('Importing bus stops data');
    
    try {
      // In a real implementation, this would fetch from BMTC's system
      // For this example, we'll simulate fetching from their API
      const response = await axios.get(config.bmtcApi.stopsEndpoint, {
        headers: {
          'Authorization': `Bearer ${config.bmtcApi.apiKey}`
        }
      });
      
      const stops = response.data;
      
      // Save raw data for audit trail
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      fs.writeFileSync(
        path.join(config.dataDirectories.raw, `stops_${timestamp}.json`),
        JSON.stringify(stops, null, 2)
      );
      
      // Process and transform stops data
      const transformedStops = stops.map(stop => ({
        stopId: stop.stop_id.toString(),
        stopName: stop.stop_name,
        location: {
          type: 'Point',
          coordinates: [parseFloat(stop.longitude), parseFloat(stop.latitude)]
        },
        address: stop.address || '',
        amenities: {
          hasShelter: Boolean(stop.has_shelter),
          hasSeating: Boolean(stop.has_seating),
          hasDisplayBoard: Boolean(stop.has_display),
          isAccessible: Boolean(stop.is_accessible)
        },
        routes: stop.routes || []
      }));
      
      // Batch insert into MongoDB
      // Using bulk operations for better performance
      const operations = transformedStops.map(stop => ({
        updateOne: {
          filter: { stopId: stop.stopId },
          update: { $set: stop },
          upsert: true
        }
      }));
      
      if (operations.length > 0) {
        const result = await Stop.bulkWrite(operations);
        logger.info(`Stops import completed: ${result.upsertedCount} inserted, ${result.modifiedCount} updated`);
      } else {
        logger.warn('No stops data to import');
      }
      
      this.stats.recordsProcessed += transformedStops.length;
      return transformedStops.length;
    } catch (error) {
      logger.error('Error importing stops:', error);
      this.stats.errors++;
      throw error;
    }
  }

  // Import routes from BMTC data source
  async importRoutes() {
    logger.info('Importing routes data');
    
    try {
      // In a real implementation, this would fetch from BMTC's system
      const response = await axios.get(config.bmtcApi.routesEndpoint, {
        headers: {
          'Authorization': `Bearer ${config.bmtcApi.apiKey}`
        }
      });
      
      const routes = response.data;
      
      // Save raw data
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      fs.writeFileSync(
        path.join(config.dataDirectories.raw, `routes_${timestamp}.json`),
        JSON.stringify(routes, null, 2)
      );
      
      // Transform routes data
      const transformedRoutes = routes.map(route => ({
        routeId: route.route_id.toString(),
        routeName: route.route_name,
        origin: route.origin,
        destination: route.destination,
        distance: parseFloat(route.distance),
        frequency: parseInt(route.frequency, 10),
        stops: (route.stops || []).map(stop => ({
          stopId: stop.stop_id.toString(),
          stopName: stop.stop_name,
          sequenceNumber: parseInt(stop.sequence, 10),
          distanceFromOrigin: parseFloat(stop.distance),
          expectedTravelTime: parseInt(stop.travel_time, 10)
        })),
        schedule: (route.schedule || []).map(sched => ({
          dayType: sched.day_type,
          trips: (sched.trips || []).map(trip => ({
            departureTime: trip.departure_time,
            arrivalTime: trip.arrival_time,
            busType: trip.bus_type
          }))
        }))
      }));
      
      // Batch insert into MongoDB
      const operations = transformedRoutes.map(route => ({
        updateOne: {
          filter: { routeId: route.routeId },
          update: { $set: route },
          upsert: true
        }
      }));
      
      if (operations.length > 0) {
        const result = await Route.bulkWrite(operations);
        logger.info(`Routes import completed: ${result.upsertedCount} inserted, ${result.modifiedCount} updated`);
      } else {
        logger.warn('No routes data to import');
      }
      
      this.stats.recordsProcessed += transformedRoutes.length;
      return transformedRoutes.length;
    } catch (error) {
      logger.error('Error importing routes:', error);
      this.stats.errors++;
      throw error;
    }
  }

  // Import buses from BMTC data source
  async importBuses() {
    logger.info('Importing buses data');
    
    try {
      // In a real implementation, this would fetch from BMTC's system
      const response = await axios.get(config.bmtcApi.busesEndpoint, {
        headers: {
          'Authorization': `Bearer ${config.bmtcApi.apiKey}`
        }
      });
      
      const buses = response.data;
      
      // Save raw data
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      fs.writeFileSync(
        path.join(config.dataDirectories.raw, `buses_${timestamp}.json`),
        JSON.stringify(buses, null, 2)
      );
      
      // Transform buses data
      const transformedBuses = buses.map(bus => ({
        vehicleId: bus.vehicle_id.toString(),
        registrationNumber: bus.registration_number,
        routeId: bus.route_id.toString(),
        capacity: parseInt(bus.capacity, 10),
        isActive: Boolean(bus.is_active),
        lastServiceDate: bus.last_service_date ? new Date(bus.last_service_date) : null,
        features: {
          isAC: Boolean(bus.is_ac),
          isElectric: Boolean(bus.is_electric),
          hasWifi: Boolean(bus.has_wifi),
          isWheelchairAccessible: Boolean(bus.is_wheelchair_accessible)
        }
      }));
      
      // Batch insert into MongoDB
      const operations = transformedBuses.map(bus => ({
        updateOne: {
          filter: { vehicleId: bus.vehicleId },
          update: { $set: bus },
          upsert: true
        }
      }));
      
      if (operations.length > 0) {
        const result = await Bus.bulkWrite(operations);
        logger.info(`Buses import completed: ${result.upsertedCount} inserted, ${result.modifiedCount} updated`);
      } else {
        logger.warn('No buses data to import');
      }
      
      this.stats.recordsProcessed += transformedBuses.length;
      return transformedBuses.length;
    } catch (error) {
      logger.error('Error importing buses:', error);
      this.stats.errors++;
      throw error;
    }
  }

  // Fetch real-time GPS data from BMTC tracking system
  async fetchRealtimeGpsData() {
    logger.info('Fetching real-time GPS data');
    
    try {
      // In a real implementation, this would fetch from BMTC's tracking system
      const response = await axios.get(config.bmtcApi.gpsEndpoint, {
        headers: {
          'Authorization': `Bearer ${config.bmtcApi.apiKey}`
        }
      });
      
      const gpsData = response.data;
      
      // Save raw data (optional - could be a lot of data)
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      fs.writeFileSync(
        path.join(config.dataDirectories.raw, `gps_${timestamp}.json`),
        JSON.stringify(gpsData, null, 2)
      );
      
      // Transform GPS data
      const transformedGpsData = gpsData.map(data => ({
        vehicleId: data.vehicle_id.toString(),
        routeId: data.route_id.toString(),
        location: {
          type: 'Point',
          coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)]
        },
        speed: parseFloat(data.speed),
        heading: parseFloat(data.heading),
        nextStopId: data.next_stop_id ? data.next_stop_id.toString() : null,
        delay: parseFloat(data.delay || 0),
        timestamp: new Date(data.timestamp)
      }));
      
      // Insert into MongoDB
      if (transformedGpsData.length > 0) {
        await BusLocation.insertMany(transformedGpsData);
        logger.info(`GPS data import completed: ${transformedGpsData.length} locations inserted`);
      } else {
        logger.warn('No GPS data to import');
      }
      
      this.stats.recordsProcessed += transformedGpsData.length;
      return transformedGpsData.length;
    } catch (error) {
      logger.error('Error fetching GPS data:', error);
      this.stats.errors++;
      throw error;
    }
  }

  // Update schedule data from BMTC source
  async updateScheduleData() {
    logger.info('Updating schedule data');
    
    try {
      // This method would update the schedule data by fetching from BMTC's system
      // For this example, we'll just call the importRoutes method which already includes schedule data
      const count = await this.importRoutes();
      logger.info(`Schedule data update completed for ${count} routes`);
      return count;
    } catch (error) {
      logger.error('Error updating schedule data:', error);
      this.stats.errors++;
      throw error;
    }
  }

  // Generate GTFS static feed
  async generateGtfsStaticFeed() {
    logger.info('Generating GTFS static feed');
    
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const outputDir = path.join(config.dataDirectories.gtfs, `gtfs_${timestamp}`);
      
      // Create output directory
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate agency.txt
      const agency = [{
        agency_id: 'BMTC',
        agency_name: 'Bangalore Metropolitan Transport Corporation',
        agency_url: 'https://mybmtc.karnataka.gov.in',
        agency_timezone: 'Asia/Kolkata',
        agency_lang: 'en',
        agency_phone: '1800-425-1663',
        agency_fare_url: 'https://mybmtc.karnataka.gov.in/fare',
      }];
      
      this.writeGtfsCsv(outputDir, 'agency.txt', agency);
      
      // Generate stops.txt
      const stops = await Stop.find({});
      const stopsGtfs = stops.map(stop => ({
        stop_id: stop.stopId,
        stop_name: stop.stopName,
        stop_lat: stop.location.coordinates[1],
        stop_lon: stop.location.coordinates[0],
        wheelchair_boarding: stop.amenities.isAccessible ? 1 : 0,
      }));
      
      this.writeGtfsCsv(outputDir, 'stops.txt', stopsGtfs);
      
      // Generate routes.txt
      const routes = await Route.find({});
      const routesGtfs = routes.map(route => ({
        route_id: route.routeId,
        agency_id: 'BMTC',
        route_short_name: route.routeId,
        route_long_name: route.routeName,
        route_type: 3, // Bus service
        route_color: '0000FF',
        route_text_color: 'FFFFFF',
      }));
      
      this.writeGtfsCsv(outputDir, 'routes.txt', routesGtfs);
      
      // Generate trips.txt, stop_times.txt, and calendar.txt
      // These are more complex and would require more detailed schedule data
      // For this example, we'll just create a simplified version
      
      const trips = [];
      const stopTimes = [];
      const calendar = [];
      
      // Create a simplified calendar (every day service)
      const defaultCalendar = {
        service_id: 'everyday',
        monday: 1,
        tuesday: 1,
        wednesday: 1,
        thursday: 1,
        friday: 1,
        saturday: 1,
        sunday: 1,
        start_date: '20240101',
        end_date: '20241231',
      };
      
      calendar.push(defaultCalendar);
      
      // Create trips and stop times for each route
      routes.forEach(route => {
        // We'll create one trip per day type for simplicity
        const dayTypes = ['WEEKDAY', 'SATURDAY', 'SUNDAY'];
        
        dayTypes.forEach(dayType => {
          const scheduleForDayType = route.schedule.find(s => s.dayType === dayType);
          
          if (scheduleForDayType && scheduleForDayType.trips.length > 0) {
            // Use the first trip of the day as an example
            const firstTrip = scheduleForDayType.trips[0];
            
            const tripId = `${route.routeId}_${dayType}_1`;
            
            trips.push({
              route_id: route.routeId,
              service_id: 'everyday',
              trip_id: tripId,
              trip_headsign: route.destination,
              direction_id: 0,
              shape_id: route.routeId,
            });
            
            // Create stop times for each stop in the route
            if (route.stops && route.stops.length > 0) {
              route.stops.forEach((stop, index) => {
                // Simplified time calculation based on expectedTravelTime
                const departureTime = 
                  index === route.stops.length - 1 ? 
                  firstTrip.arrivalTime : 
                  this.addMinutesToTime(firstTrip.departureTime, stop.expectedTravelTime);
                
                const arrivalTime = departureTime; // Simplified - arrival and departure are the same
                
                stopTimes.push({
                  trip_id: tripId,
                  arrival_time: arrivalTime,
                  departure_time: departureTime,
                  stop_id: stop.stopId,
                  stop_sequence: stop.sequenceNumber,
                  pickup_type: 0,
                  drop_off_type: 0,
                });
              });
            }
          }
        });
      });
      
      this.writeGtfsCsv(outputDir, 'trips.txt', trips);
      this.writeGtfsCsv(outputDir, 'stop_times.txt', stopTimes);
      this.writeGtfsCsv(outputDir, 'calendar.txt', calendar);
      
      // Create a zip file of the GTFS feed
      // In a real implementation, we would use the 'archiver' package to create a zip file
      // For this example, we'll just log that the feed was generated
      
      logger.info(`GTFS static feed generated at ${outputDir}`);
      
      return outputDir;
    } catch (error) {
      logger.error('Error generating GTFS static feed:', error);
      this.stats.errors++;
      throw error;
    }
  }

  // Helper method to write GTFS CSV files
  writeGtfsCsv(outputDir, filename, data) {
    const parser = new Parser({ header: true });
    const csv = parser.parse(data);
    fs.writeFileSync(path.join(outputDir, filename), csv);
  }

  // Helper method to add minutes to a time string (HH:MM:SS)
  addMinutesToTime(timeStr, minutes) {
    const [hours, mins, secs] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins, secs);
    date.setMinutes(date.getMinutes() + minutes);
    
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  }

  // Clean up old data (TTL index should handle this, but this is a backup)
  async cleanupOldData() {
    logger.info('Cleaning up old data');
    
    try {
      // Delete bus locations older than 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = await BusLocation.deleteMany({ timestamp: { $lt: oneDayAgo } });
      
      logger.info(`Deleted ${result.deletedCount} old bus locations`);
      
      // Clean up old raw data files (keep the last 7 days)
      this.cleanupOldFiles(config.dataDirectories.raw, 7);
      
      // Clean up old GTFS feeds (keep the last 30 days)
      this.cleanupOldFiles(config.dataDirectories.gtfs, 30);
      
      logger.info('Data cleanup completed');
    } catch (error) {
      logger.error('Error cleaning up old data:', error);
      this.stats.errors++;
      throw error;
    }
  }

  // Helper method to clean up old files
  cleanupOldFiles(directory, daysToKeep) {
    const files = fs.readdirSync(directory);
    const now = Date.now();
    const daysInMs = daysToKeep * 24 * 60 * 60 * 1000;
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > daysInMs) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted old file: ${filePath}`);
      }
    });
  }

  // Get service statistics
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      uptime: this.isRunning ? (new Date() - this.stats.lastRun) / 1000 : 0,
      currentTime: new Date()
    };
  }

  // Stop the service
  async stop() {
    if (!this.isRunning) {
      logger.warn('Data integration service is not running');
      return;
    }

    logger.info('Stopping BMTC data integration service');
    schedule.gracefulShutdown();
    this.isRunning = false;
    logger.info('BMTC data integration service stopped');
  }
}

// Export the service
module.exports = BMTCDataIntegrationService;