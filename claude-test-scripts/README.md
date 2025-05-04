# BMTC MCP API Test Scripts

These scripts help test the BMTC MCP API and generate sample responses that can be used with Claude.

## Setup

1. Make sure the BMTC MCP server is running using Docker Compose:

```bash
docker-compose -f docker-compose.test.yml up -d
```

2. Install dependencies:

```bash
cd claude-test-scripts
npm install
```

## Running the Tests

Run all tests:

```bash
npm test
```

This will make requests to all API endpoints and save the responses in the `api-responses` directory.

## Using with Claude

1. Run the tests to generate sample responses
2. Upload the JSON files from the `api-responses` directory to Claude
3. Ask Claude to interpret the data

Example prompts for Claude:

- "Can you explain the bus routes available based on the bus-routes.json file?"
- "When will the next bus arrive at Kempegowda Bus Station according to arrivals-KBS-01.json?"
- "What's the fare from Kempegowda Bus Station to the Airport based on the fare calculation JSON?"
