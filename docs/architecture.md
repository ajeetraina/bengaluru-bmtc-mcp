# BMTC MCP Server Architecture

This document describes the architecture of the Bengaluru BMTC Mall Connector Program (MCP) server.

## System Architecture Overview

The BMTC MCP server follows a modular, layered architecture that separates concerns and promotes maintainability. The system architecture is designed to handle real-time transit data from Bangalore Metropolitan Transport Corporation (BMTC) buses and provide it to client applications through a standardized API.

![BMTC MCP Architecture](../docs/images/architecture-diagram.png)

## Core Components

### 1. API Layer

The API layer provides RESTful endpoints for clients to access transit data. It handles:

- Authentication and authorization
- Request validation
- Response formatting
- Rate limiting and API security

Technologies: Express.js, JWT for authentication, Express middleware for request handling

### 2. Service Layer

The service layer contains the business logic of the application, including:

- Data transformation and normalization
- Integration with external APIs (BMTC API)
- Complex calculations (e.g., ETA calculation)
- Business rules implementation

### 3. Data Access Layer

The data access layer manages interactions with the database:

- CRUD operations
- Data validation
- Schema management
- Query optimizations

Technologies: Mongoose ODM, MongoDB

### 4. Caching Layer

The caching layer improves performance by storing frequently accessed data:

- Route information caching
- Stop information caching
- Short-term ETA caching
- Request-level caching

Technologies: Redis

### 5. External Integration Layer

This layer manages interactions with external systems:

- BMTC API client
- Other third-party API integrations
- Data synchronization mechanisms

## Data Flow

1. **Client Request**: Mobile apps or client systems request information through the API.
2. **Authentication**: The API layer validates API keys or JWT tokens.
3. **Caching Check**: The system checks if the requested data exists in cache.
4. **Data Processing**: If not in cache, the service layer processes the request, retrieving data from the database or external APIs.
5. **Response**: Processed data is returned to the client.

## Real-time Data Processing

For real-time bus tracking:

1. The system periodically polls the BMTC API for bus location updates.
2. New location data is stored in the database and used to update the cache.
3. The ETA calculation service uses this data to estimate arrival times.

## Database Design

### Collections

1. **Routes**: Contains bus route information including route ID, name, stops sequence.
2. **Stops**: Contains bus stop information including location coordinates, name, address.
3. **BusLocations**: Contains real-time bus location data including GPS coordinates, speed, timestamp.
4. **Users**: Contains user authentication information.

## Security Architecture

The security architecture focuses on:

1. **Authentication**: JWT-based authentication for API access.
2. **Authorization**: Role-based access control for administrative actions.
3. **Data Protection**: Encrypted storage of sensitive information.
4. **API Security**: Rate limiting, input validation, and parameterized queries.

## Scalability Considerations

The architecture supports horizontal scaling through:

1. **Stateless Design**: API servers are stateless and can be scaled horizontally.
2. **Caching**: Redis caching reduces database load.
3. **Database Indexing**: Geospatial and standard indexes optimize queries.
4. **Microservices Potential**: The modular design allows future decomposition into microservices.

## Deployment Architecture

The deployment architecture utilizes containerization for consistency across environments:

1. **Docker Containers**: Application components are containerized.
2. **Docker Compose**: For development and simple deployments.
3. **Container Orchestration**: Potential for Kubernetes in production for scaling and management.

## Monitoring and Logging

The architecture includes:

1. **Centralized Logging**: Using Winston for structured logging.
2. **Performance Monitoring**: Server and application metrics collection.
3. **Error Tracking**: Capturing and reporting application errors.

## Future Extensibility

The architecture is designed to accommodate future enhancements:

1. **WebSocket Support**: For real-time updates to clients.
2. **Analytics Engine**: For traffic pattern analysis and service optimization.
3. **Machine Learning Integration**: For more accurate ETA predictions.
