require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bmtc-mcp'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  bmtcApi: {
    baseUrl: process.env.BMTC_API_BASE_URL || 'https://api.bmtc.karnataka.gov.in',
    apiKey: process.env.BMTC_API_KEY || 'your-api-key',
    healthEndpoint: process.env.BMTC_API_HEALTH_ENDPOINT || 'https://api.bmtc.karnataka.gov.in/health',
    stopsEndpoint: process.env.BMTC_API_STOPS_ENDPOINT || 'https://api.bmtc.karnataka.gov.in/v1/stops',
    routesEndpoint: process.env.BMTC_API_ROUTES_ENDPOINT || 'https://api.bmtc.karnataka.gov.in/v1/routes',
    busesEndpoint: process.env.BMTC_API_BUSES_ENDPOINT || 'https://api.bmtc.karnataka.gov.in/v1/buses',
    gpsEndpoint: process.env.BMTC_API_GPS_ENDPOINT || 'https://api.bmtc.karnataka.gov.in/v1/gps'
  },
  bmtcScheduleDb: {
    uri: process.env.BMTC_SCHEDULE_DB_URI || 'mongodb://localhost:27017/bmtc-schedule'
  },
  dataDirectories: {
    raw: process.env.RAW_DATA_DIR || './data/raw',
    processed: process.env.PROCESSED_DATA_DIR || './data/processed',
    gtfs: process.env.GTFS_DATA_DIR || './data/gtfs',
    logs: process.env.LOGS_DIR || './logs'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  developerPortal: {
    enabled: process.env.DEVELOPER_PORTAL_ENABLED === 'true' || false,
    apiKeyRequestEnabled: process.env.API_KEY_REQUEST_ENABLED === 'true' || false
  },
  gtfs: {
    agencyId: process.env.GTFS_AGENCY_ID || 'BMTC',
    agencyName: process.env.GTFS_AGENCY_NAME || 'Bangalore Metropolitan Transport Corporation',
    agencyUrl: process.env.GTFS_AGENCY_URL || 'https://mybmtc.karnataka.gov.in',
    timezone: process.env.GTFS_TIMEZONE || 'Asia/Kolkata'
  }
};
