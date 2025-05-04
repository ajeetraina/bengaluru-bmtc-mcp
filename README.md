# Bangalore BMTC Mobility Connectivity Platform (MCP)

This repository contains the implementation of a Mobility Connectivity Platform (MCP) server for the Bangalore Metropolitan Transport Corporation (BMTC), inspired by Singapore's Land Transport Authority (LTA) DataMall API system.

## Overview

The BMTC MCP server provides real-time access to transportation information including bus arrivals, schedules, routes, and service updates to improve the passenger experience and operational efficiency of Bangalore's public transport system.

## Features

- Real-time bus tracking and ETA calculation
- Route and schedule information
- Bus stop details and nearby stops search
- Service alerts and disruption notifications
- Fare calculation
- GTFS and GTFS-RT feed generation
- Developer API with documentation

## Architecture

The system follows a modern microservices architecture with:

1. **Data Integration Layer**: Connects to BMTC's tracking systems and data sources
2. **Core Services**: Processes and manages transportation data
3. **API Gateway**: Manages API access, authentication, and documentation
4. **Frontend Applications**: Web portal, mobile app integration, and developer console

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- MongoDB 4.4+
- Redis 6+

### Installation

```bash
# Clone the repository
git clone https://github.com/ajeetraina/bengaluru-bmtc-mcp.git
cd bengaluru-bmtc-mcp

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm start
```

## API Documentation

API documentation is available at `/api/docs` when running the server.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
