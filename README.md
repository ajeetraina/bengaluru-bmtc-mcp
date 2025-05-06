# Bengaluru BMTC MCP Server

An implementation of a Model Context Protocol (MCP) server for Bangalore Metropolitan Transport Corporation (BMTC) bus services.

## Architecture


The BMTC MCP server follows a modular, layered architecture. The system is designed to handle real-time transit data from Bangalore Metropolitan Transport Corporation buses and provide it through a standardized API.

### Core Components

1. **API Layer**: RESTful endpoints for authentication, routes, stops, bus locations, and ETA information
2. **Service Layer**: Business logic, data transformation, and ETA calculations
3. **Data Access Layer**: MongoDB integration via Mongoose ODM
4. **Caching Layer**: Redis-based caching for improved performance
5. **External Integration Layer**: BMTC API integration

[Read the full architecture documentation](docs/architecture.md)

## Features

- Real-time bus location tracking
- Route information and scheduling
- Stop details and ETA (Estimated Time of Arrival)
- Support for over 2,200 bus routes and 8,400+ bus stops in Bengaluru
- Authentication and authorization
- Data caching and optimization
- GeoSpatial queries for nearby stops and buses

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB
- Redis (optional, for caching)
- Git

## Installation and Setup

### Method 1: Standard Installation

1. **Clone the repository**

```bash
git clone https://github.com/ajeetraina/bengaluru-bmtc-mcp.git
cd bengaluru-bmtc-mcp
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/bmtc-mcp
REDIS_URI=redis://localhost:6379
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=86400
BMTC_API_ENDPOINT=https://bmtc-api-endpoint.example
BMTC_API_KEY=your_bmtc_api_key_here
CACHE_DURATION=300
LOG_LEVEL=info
```

4. **Seed the database with mock data (optional)**

```bash
node src/scripts/seed.js
```

5. **Start the server**

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

### Method 2: Using Docker Compose

1. **Clone the repository**

```bash
git clone https://github.com/ajeetraina/bengaluru-bmtc-mcp.git
cd bengaluru-bmtc-mcp
```

2. **Configure environment variables (optional)**

You can modify the environment variables directly in the `docker-compose.yml` file or create a `.env` file:

```bash
cp .env.example .env
```

3. **Build and start the containers**

```bash
docker-compose up -d
```

This will start three containers:
- `bmtc-mcp-api`: The Node.js API server
- `bmtc-mcp-mongo`: MongoDB database
- `bmtc-mcp-redis`: Redis cache server

4. **Seed the database with mock data (optional)**

```bash
docker-compose exec api node src/scripts/seed.js
```

5. **View logs**

```bash
docker-compose logs -f api
```

6. **Stop the containers**

```bash
docker-compose down
```

To remove volumes as well:

```bash
docker-compose down -v
```

## Using the API

Once the server is running, you can access the API at:

```
http://localhost:3000/api/v1
```

For API documentation, visit:

```
http://localhost:3000/api-docs
```

### Example API Endpoints

```
# Authentication
POST /api/v1/auth/login
GET /api/v1/auth/me

# Routes
GET /api/v1/routes
GET /api/v1/routes/:routeId
GET /api/v1/routes/search?source=Kempegowda&destination=Electronic

# Stops
GET /api/v1/stops
GET /api/v1/stops/:stopId
GET /api/v1/stops/near?lat=12.9767&lng=77.5713&radius=500
GET /api/v1/stops/search?query=Lalbagh

# Bus Locations
GET /api/v1/bus-locations
GET /api/v1/bus-locations/:busId
GET /api/v1/bus-locations/near?lat=12.9767&lng=77.5713&radius=1000

# ETA
GET /api/v1/eta/:stopId
GET /api/v1/eta/:stopId/:routeId
```

## API Keys

### JWT Secret

The JWT secret is used for signing authentication tokens. Generate a secure random string:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add this to your `.env` file:

```
JWT_SECRET=your_generated_secret_here
```

### BMTC API Key

For development, you can use mock data without an actual BMTC API key:

```
BMTC_API_ENDPOINT=https://bmtc-api-endpoint.example
BMTC_API_KEY=your_bmtc_api_key_here
```

For production, you would need to contact BMTC directly to request official API access.

## Development

### Testing

Run the tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Linting

Check code style:

```bash
npm run lint
```

Fix code style issues:

```bash
npm run lint:fix
```

### Project Structure

```
bengaluru-bmtc-mcp/
├── .env.example            # Environment variables template
├── .eslintrc.json          # ESLint configuration
├── .github/                # GitHub configuration
│   └── workflows/          # GitHub Actions workflows
├── .gitignore              # Git ignore file
├── CONTRIBUTING.md         # Contribution guidelines
├── Dockerfile              # Docker configuration
├── LICENSE                 # MIT License
├── README.md               # Project documentation
├── docker-compose.yml      # Docker Compose configuration
├── docs/                   # Documentation
│   ├── api.md              # API documentation
│   └── setup.md            # Setup guide
├── jest.config.js          # Jest configuration
├── package.json            # Project dependencies
└── src/                    # Source code
    ├── config/             # Configuration files
    ├── controllers/        # Request handlers
    ├── index.js            # Application entry point
    ├── middlewares/        # Express middlewares
    ├── models/             # MongoDB models
    ├── public/             # Static files
    ├── routes/             # API routes
    ├── scripts/            # Utility scripts
    ├── services/           # External service integrations
    ├── tests/              # Test files
    └── utils/              # Utility functions
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Bangalore Metropolitan Transport Corporation (BMTC)](https://mybmtc.karnataka.gov.in)
- [Singapore LTA MCP Implementation](https://github.com/arjunkmrm/mcp-sg-lta) for inspiration
