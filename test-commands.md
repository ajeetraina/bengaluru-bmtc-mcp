# Testing BMTC MCP Server with Docker

This guide provides step-by-step instructions for testing the BMTC MCP server using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- Git (to clone the repository)

## Setup and Testing Steps

1. **Clone the repository (if you haven't already)**

```bash
git clone https://github.com/ajeetraina/bengaluru-bmtc-mcp.git
cd bengaluru-bmtc-mcp
```

2. **Start the Docker containers**

```bash
docker-compose -f docker-compose.test.yml up -d
```

This will start:
- The BMTC MCP API server on port 3000
- MongoDB on port 27017
- Redis on port 6379
- Mongo Express (MongoDB web interface) on port 8081

3. **Check that the containers are running**

```bash
docker-compose -f docker-compose.test.yml ps
```

4. **Test the API endpoints using curl**

   a. Test the health endpoint (no API key required):
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

   b. Test the bus routes endpoint (requires API key):
   ```bash
   curl -H "x-api-key: test-api-key-12345" http://localhost:3000/api/v1/bus-routes
   ```

   c. Test bus arrivals for a specific stop:
   ```bash
   curl -H "x-api-key: test-api-key-12345" http://localhost:3000/api/v1/bus-arrivals/KBS-01
   ```

   d. Test fare calculation:
   ```bash
   curl -H "x-api-key: test-api-key-12345" "http://localhost:3000/api/v1/fare-calculator?fromStopId=KBS-01&toStopId=KDG-01"
   ```

5. **Run the test script to generate sample responses for Claude**

```bash
cd claude-test-scripts
npm install
npm test
```

This will generate sample responses in the `api-responses` directory that you can upload to Claude for analysis.

6. **Access MongoDB Express**

Open your browser and go to http://localhost:8081 to access the MongoDB web interface.

Login credentials:
- Username: admin
- Password: password

You can use this interface to explore the database, view collections, and modify data if needed.

7. **Stop the containers when done**

```bash
docker-compose -f docker-compose.test.yml down
```

To remove the volumes as well (this will delete all data):

```bash
docker-compose -f docker-compose.test.yml down -v
```

## Troubleshooting

1. **If the API server fails to start**

Check the logs:
```bash
docker-compose -f docker-compose.test.yml logs bmtc-mcp-api
```

2. **If MongoDB fails to initialize**

Check the MongoDB logs:
```bash
docker-compose -f docker-compose.test.yml logs mongodb
```

3. **If API requests return 401 Unauthorized**

Make sure you're using the correct API key in the header:
```
x-api-key: test-api-key-12345
```

4. **If you need to reset the database**

Stop the containers, remove the volumes, and start again:
```bash
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.test.yml up -d
```
