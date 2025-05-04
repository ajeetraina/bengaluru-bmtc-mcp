# BMTC MCP Data Integration Guide

This guide explains how the Data Integration Service works and how to configure it for your specific BMTC data sources.

## Overview

The Data Integration Service is responsible for:

1. Connecting to various BMTC data sources (GPS, schedules, etc.)
2. Transforming the data into standardized formats
3. Storing the data in MongoDB for use by the MCP server
4. Generating GTFS and GTFS-RT feeds

## Components

### Core Components

- **Data Collectors**: Connect to BMTC data sources and fetch raw data
- **Data Transformers**: Convert raw data into standardized formats
- **Data Storage**: Store processed data in MongoDB
- **GTFS Generator**: Generate GTFS and GTFS-RT feeds
- **Job Scheduler**: Schedule recurring jobs for data collection and processing

## Configuration

### Environment Variables

The Data Integration Service uses the following environment variables for configuration:

- `BMTC_API_BASE_URL`: The base URL for the BMTC API
- `BMTC_API_KEY`: The API key for accessing BMTC data sources
- `BMTC_API_HEALTH_ENDPOINT`: The health check endpoint for the BMTC API
- `BMTC_API_STOPS_ENDPOINT`: The endpoint for fetching bus stops data
- `BMTC_API_ROUTES_ENDPOINT`: The endpoint for fetching bus routes data
- `BMTC_API_BUSES_ENDPOINT`: The endpoint for fetching buses data
- `BMTC_API_GPS_ENDPOINT`: The endpoint for fetching real-time GPS data
- `BMTC_SCHEDULE_DB_URI`: The MongoDB URI for the BMTC schedule database
- `RAW_DATA_DIR`: The directory for storing raw data files
- `PROCESSED_DATA_DIR`: The directory for storing processed data files
- `GTFS_DATA_DIR`: The directory for storing GTFS feeds
- `LOGS_DIR`: The directory for storing log files

### Configuration File

The configuration file (`src/config/index.js`) contains additional settings for the Data Integration Service. You can modify this file to customize the service for your specific BMTC data sources.

## Scheduled Jobs

The Data Integration Service schedules the following jobs:

- **GPS Data Fetch**: Every minute
- **Schedule Data Update**: Daily at 1:00 AM
- **GTFS Static Feed Generation**: Weekly on Sunday at 2:00 AM
- **Data Cleanup**: Monthly on the 1st at 3:00 AM

You can customize these schedules in the `scheduleJobs` method of the `BMTCDataIntegrationService` class.

## Data Sources

### BMTC GPS/ATD Tracking System

The Data Integration Service connects to the BMTC GPS/ATD tracking system to fetch real-time bus location data. The data is fetched from the `BMTC_API_GPS_ENDPOINT` specified in the configuration.

### BMTC Schedule Database

The Data Integration Service connects to the BMTC schedule database to fetch bus schedule data. The database URI is specified in the `BMTC_SCHEDULE_DB_URI` environment variable.

### Other Data Sources

The Data Integration Service can also connect to other BMTC data sources as needed. You can add additional data collectors to the service by implementing them in the `BMTCDataIntegrationService` class.

## Data Processing

### Data Transformation

Raw data from BMTC sources is transformed into standardized formats before being stored in MongoDB. The transformation logic is implemented in the following methods:

- `importStops`: Transforms bus stops data
- `importRoutes`: Transforms bus routes data
- `importBuses`: Transforms buses data
- `fetchRealtimeGpsData`: Transforms real-time GPS data

### GTFS Generation

The Data Integration Service generates GTFS and GTFS-RT feeds for interoperability with other transit applications. The GTFS generation logic is implemented in the `generateGtfsStaticFeed` method.

## CLI Tool

The Data Integration Service includes a CLI tool (`src/data-integration-cli.js`) for manual interaction. The CLI tool supports the following commands:

- `start`: Start the data integration service with scheduled jobs
- `stop`: Stop the data integration service
- `import-stops`: Import bus stops data
- `import-routes`: Import bus routes data
- `import-buses`: Import buses data
- `fetch-gps`: Fetch real-time GPS data
- `update-schedules`: Update schedule data
- `generate-gtfs`: Generate GTFS static feed
- `cleanup`: Clean up old data
- `status`: Display service statistics
- `full-import`: Perform a full data import
- `help`: Display help information

## Usage

### Starting the Service

```bash
npm run data-integration -- start
```

### Manual Data Import

```bash
npm run data-integration -- import-stops
npm run data-integration -- import-routes
npm run data-integration -- import-buses
```

### Manual GTFS Generation

```bash
npm run data-integration -- generate-gtfs
```

### Checking Service Status

```bash
npm run data-integration -- status
```

## Extending the Service

### Adding New Data Sources

To add a new data source, you need to:

1. Add the API endpoint to the configuration file
2. Implement a data collector method in the `BMTCDataIntegrationService` class
3. Schedule the data collection job

### Customizing Data Transformation

To customize data transformation, you need to modify the transformation logic in the corresponding methods of the `BMTCDataIntegrationService` class.

### Customizing GTFS Generation

To customize GTFS generation, you need to modify the `generateGtfsStaticFeed` method of the `BMTCDataIntegrationService` class.

## Troubleshooting

### Common Issues

#### Data Source Connection Errors

If you encounter errors connecting to BMTC data sources, check that:

- The API endpoints are correctly configured
- The API key is valid
- The BMTC systems are available

#### Data Transformation Errors

If you encounter errors during data transformation, check that:

- The data source is providing data in the expected format
- The transformation logic is handling all edge cases

#### MongoDB Connection Errors

If you encounter errors connecting to MongoDB, check that:

- MongoDB is running
- The MongoDB URI is correctly configured

### Logs

The Data Integration Service logs information to the `logs` directory. Check these logs for detailed error information when troubleshooting issues.
