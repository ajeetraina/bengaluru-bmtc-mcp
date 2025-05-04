# Docker Deployment Guide for BMTC MCP

This guide explains how to deploy the BMTC Mobility Connectivity Platform (MCP) using Docker in various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Deployment](#development-deployment)
3. [Production Deployment](#production-deployment)
4. [Container Management](#container-management)
5. [Monitoring](#monitoring)
6. [Backup and Restore](#backup-and-restore)
7. [Scaling](#scaling)

## Prerequisites

Before deploying the BMTC MCP using Docker, ensure you have the following prerequisites installed:

- Docker Engine (version 19.03 or later)
- Docker Compose (version 1.27 or later)
- Git

You'll also need to clone the repository:

```bash
git clone https://github.com/ajeetraina/bengaluru-bmtc-mcp.git
cd bengaluru-bmtc-mcp
```

## Development Deployment

For development purposes, use the development Docker Compose configuration:

### 1. Configure Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file to set the necessary variables for your development environment.

### 2. Start the Development Environment

```bash
docker-compose -f docker/docker-compose.dev.yml up -d
```

This will start the following services:

- BMTC MCP API Server (with hot reloading for development)
- MongoDB
- Redis
- Mongo Express (for database management)
- Redis Commander (for Redis management)

### 3. Access Development Services

- BMTC MCP API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs
- Mongo Express: http://localhost:8081
- Redis Commander: http://localhost:8082

### 4. Development Workflow

The development environment is configured with hot reloading, so any changes you make to the source code will automatically restart the server.

## Production Deployment

For production deployment, use the production Docker Compose configuration:

### 1. Configure Environment Variables

```bash
cp .env.example .env.prod
```

Edit the `.env.prod` file to set the necessary variables for your production environment. Make sure to set secure passwords and API keys.

### 2. Generate SSL Certificates

For production, you should use proper SSL certificates. If you don't have certificates, you can generate self-signed certificates for testing:

```bash
mkdir -p docker/nginx/ssl
cd docker/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt
cd ../../..
```

For production, replace these with proper certificates from a certificate authority.

### 3. Start the Production Environment

```bash
docker-compose --env-file .env.prod -f docker/docker-compose.prod.yml up -d
```

This will start the following services:

- BMTC MCP API Server
- Data Integration Service
- MongoDB (with replica set)
- Redis (with persistence)
- NGINX (for reverse proxy and SSL termination)
- Prometheus (for monitoring)
- Grafana (for dashboards)

### 4. Access Production Services

- BMTC MCP API: https://api.mybmtc.karnataka.gov.in/ (or your configured domain)
- Grafana: http://localhost:3001 (internal access only)
- Prometheus: http://localhost:9090 (internal access only)

## Container Management

### Viewing Logs

```bash
# View logs for a specific service
docker-compose -f docker/docker-compose.prod.yml logs -f bmtc-mcp-api

# View logs for all services
docker-compose -f docker/docker-compose.prod.yml logs -f
```

### Restarting Services

```bash
# Restart a specific service
docker-compose -f docker/docker-compose.prod.yml restart bmtc-mcp-api

# Restart all services
docker-compose -f docker/docker-compose.prod.yml restart
```

### Stopping Services

```bash
# Stop all services
docker-compose -f docker/docker-compose.prod.yml down

# Stop all services and remove volumes
docker-compose -f docker/docker-compose.prod.yml down -v
```

## Monitoring

The production deployment includes Prometheus and Grafana for monitoring:

### Prometheus

Prometheus collects metrics from the BMTC MCP API and other services. You can access the Prometheus UI at http://localhost:9090 (internal access only).

### Grafana

Grafana provides dashboards for visualizing the metrics collected by Prometheus. You can access the Grafana UI at http://localhost:3001 (internal access only).

Default login credentials:
- Username: admin
- Password: admin (you should change this after first login)

## Backup and Restore

### Backing Up MongoDB Data

```bash
# Create a backup directory
mkdir -p backups

# Backup MongoDB data
docker-compose -f docker/docker-compose.prod.yml exec mongodb mongodump --out /data/db/backup

# Copy the backup to the host
docker cp bmtc-mongodb:/data/db/backup backups/mongodb_$(date +%Y%m%d)
```

### Restoring MongoDB Data

```bash
# Copy the backup to the container
docker cp backups/mongodb_YYYYMMDD bmtc-mongodb:/data/db/backup

# Restore MongoDB data
docker-compose -f docker/docker-compose.prod.yml exec mongodb mongorestore /data/db/backup
```

### Backing Up Redis Data

Redis is configured with AOF persistence, so data is automatically saved to disk. However, you can also create a manual backup:

```bash
# Create a backup directory
mkdir -p backups

# Trigger a Redis backup
docker-compose -f docker/docker-compose.prod.yml exec redis redis-cli SAVE

# Copy the backup to the host
docker cp bmtc-redis:/data/dump.rdb backups/redis_$(date +%Y%m%d).rdb
```

## Scaling

The BMTC MCP architecture supports horizontal scaling for increased load:

### Scaling the API Server

```bash
docker-compose -f docker/docker-compose.prod.yml up -d --scale bmtc-mcp-api=3
```

This will start 3 instances of the API server behind the NGINX reverse proxy.

### Scaling MongoDB

For production environments with high load, consider using MongoDB Atlas or a properly configured MongoDB cluster.

### Scaling Redis

For production environments with high load, consider using Redis Cluster or Redis Sentinel for high availability.
