# BMTC MCP Setup Guide

This guide will help you set up the BMTC Mobility Connectivity Platform (MCP) server.

## Prerequisites

Before setting up the MCP server, ensure you have the following installed:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) (version 16 or later)
- [MongoDB](https://www.mongodb.com/try/download/community) (version 4.4 or later)
- [Redis](https://redis.io/download) (version 6 or later)

Alternatively, if you have Docker and Docker Compose installed, you can use the provided Docker setup.

## Detailed Setup Instructions

### 1. Basic Setup

#### Clone the Repository

```bash
git clone https://github.com/ajeetraina/bengaluru-bmtc-mcp.git
cd bengaluru-bmtc-mcp
```

#### Install Dependencies

```bash
npm install
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Open the `.env` file in a text editor and configure the following variables:

- `PORT`: The port on which the server will run (default: 3000)
- `NODE_ENV`: The environment (development, production, etc.)
- `MONGODB_URI`: The MongoDB connection URI
- `REDIS_HOST` and `REDIS_PORT`: Redis connection settings
- `BMTC_API_BASE_URL` and `BMTC_API_KEY`: BMTC API connection settings

#### Create Required Directories

```bash
mkdir -p data/raw data/processed data/gtfs logs
```

### 2. MongoDB Setup

#### Start MongoDB

```bash
mongod --dbpath /path/to/data/db
```

#### Create a Database

```bash
mongo
> use bmtc-mcp
```

#### Create a Test Developer

To use the protected endpoints, you need an API key. For development purposes, you can manually add a developer entry to your MongoDB database:

```javascript
db.developers.insertOne({
  name: "Test Developer",
  email: "test@example.com",
  organization: "Test Organization",
  apiKey: "test-api-key-12345",
  tier: "FREE",
  isActive: true,
  createdAt: new Date()
})
```

### 3. Redis Setup

#### Start Redis

```bash
redis-server
```

### 4. Starting the Server

#### Development Mode

```bash
npm run dev
```

This will start the server with nodemon, which will automatically restart the server when changes are detected.

#### Production Mode

```bash
npm start
```

### 5. Starting the Data Integration Service

```bash
npm run data-integration -- start
```

This will start the data integration service with scheduled jobs for fetching and updating data.

## Docker Setup

If you prefer to use Docker, follow these steps:

### 1. Configure Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file as needed.

### 2. Build and Start the Docker Containers

```bash
docker-compose up -d
```

This will start all the required services (MCP server, data integration service, MongoDB, and Redis) in Docker containers.

### 3. Check Container Status

```bash
docker-compose ps
```

### 4. View Logs

```bash
docker-compose logs -f bmtc-mcp-server
```

```bash
docker-compose logs -f bmtc-data-integration
```

## Testing the Setup

To verify that the server is running correctly, you can make a request to the health check endpoint:

```bash
curl http://localhost:3000/api/v1/health
```

You should receive a response like:

```json
{
  "status": "OK",
  "timestamp": "2025-05-04T12:34:56.789Z"
}
```

## Troubleshooting

### Common Issues

#### MongoDB Connection Error

If you see an error like "MongoDB connection error", check that:

- MongoDB is running
- The `MONGODB_URI` in your `.env` file is correct

#### Redis Connection Error

If you see an error like "Redis connection error", check that:

- Redis is running
- The `REDIS_HOST` and `REDIS_PORT` in your `.env` file are correct

#### API Key Authentication Error

If you receive a 401 Unauthorized error when making API requests, check that:

- You have included the `x-api-key` header in your request
- The API key exists in the `developers` collection in MongoDB
- The `isActive` field for the developer is set to `true`

## Next Steps

Once you have the server running, you can:

- Access the API documentation at [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- Start making API requests using your API key
- Configure the data integration service to fetch data from your BMTC data sources
- Develop applications that use the API

Refer to the [API Overview](api-overview.md) document for more information on using the API.
