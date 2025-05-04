#!/usr/bin/env node

/**
 * BMTC Data Integration CLI
 * 
 * This CLI tool provides command-line access to the BMTC Data Integration Service.
 * It can be used to perform various data integration tasks such as importing
 * stops, routes, and buses, fetching real-time GPS data, and generating GTFS feeds.
 */

const BMTCDataIntegrationService = require('./data-integration-service');
const logger = require('./utils/logger');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Create an instance of the data integration service
const dataIntegrationService = new BMTCDataIntegrationService();

// Execute the command
async function executeCommand(command) {
  try {
    switch (command) {
      case 'start':
        await dataIntegrationService.start();
        break;
      case 'stop':
        await dataIntegrationService.stop();
        break;
      case 'import-stops':
        await dataIntegrationService.importStops();
        break;
      case 'import-routes':
        await dataIntegrationService.importRoutes();
        break;
      case 'import-buses':
        await dataIntegrationService.importBuses();
        break;
      case 'fetch-gps':
        await dataIntegrationService.fetchRealtimeGpsData();
        break;
      case 'update-schedules':
        await dataIntegrationService.updateScheduleData();
        break;
      case 'generate-gtfs':
        await dataIntegrationService.generateGtfsStaticFeed();
        break;
      case 'cleanup':
        await dataIntegrationService.cleanupOldData();
        break;
      case 'status':
        const stats = dataIntegrationService.getStats();
        console.log(JSON.stringify(stats, null, 2));
        break;
      case 'full-import':
        await dataIntegrationService.performFullDataImport();
        break;
      case 'help':
      default:
        displayHelp();
        break;
    }
  } catch (error) {
    logger.error(`Error executing command '${command}':`, error);
    process.exit(1);
  }
}

// Display help information
function displayHelp() {
  console.log(`
  BMTC Data Integration CLI

  Usage: npm run data-integration -- [command]

  Commands:
    start            Start the data integration service with scheduled jobs
    stop             Stop the data integration service
    import-stops     Import bus stops data
    import-routes    Import bus routes data
    import-buses     Import buses data
    fetch-gps        Fetch real-time GPS data
    update-schedules Update schedule data
    generate-gtfs    Generate GTFS static feed
    cleanup          Clean up old data
    status           Display service statistics
    full-import      Perform a full data import
    help             Display this help information
  `);
}

// Execute the command
executeCommand(command)
  .then(() => {
    // Exit if the command is not 'start' (which keeps the process running)
    if (command !== 'start') {
      process.exit(0);
    }
  })
  .catch(error => {
    logger.error('Unhandled error:', error);
    process.exit(1);
  });

// Handle process termination
process.on('SIGINT', async () => {
  logger.info('Received SIGINT signal. Stopping data integration service...');
  await dataIntegrationService.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM signal. Stopping data integration service...');
  await dataIntegrationService.stop();
  process.exit(0);
});
