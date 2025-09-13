# AGENTS.md

## Project Overview

AI Location Finder is an intelligent location discovery system that transforms natural language queries into actionable location recommendations. The system uses Large Language Models (LLM) and Google Maps API to understand user intent and provide contextually relevant results.

**Architecture**: Microservices with separated frontend (`ui/`) and backend (`service/`)
**Business Flow**: User query → LLM processing → Google Maps integration → Visual display
**Reference**: See [README.md](./README.md) and [Architecture Diagram](./docs/architecture-diagram.png)

## Setup Commands

### Initial Setup

```bash
# Clone and setup
git clone <repository-url>
cd ai-location-finder

# Install frontend dependencies
cd ui
npm install

# Install backend dependencies
cd ../service
npm install
```

### Development

```bash
# Start backend (Terminal 1)
cd service
npm run dev

# Start frontend (Terminal 2)
cd ui
npm start
```

### Environment Setup

```bash
# Backend configuration
cd service
cp .env.example .env
# Edit .env with your API keys:
# - GOOGLE_MAPS_API_KEY
# - GOOGLE_PLACES_API_KEY
# - OPENWEBUI_API_URL
# - OPENWEBUI_API_KEY

# Frontend configuration (optional)
cd ../ui
cp .env.example .env
# Edit .env with:
# - REACT_APP_API_URL=http://localhost:8000
# - REACT_APP_GOOGLE_MAPS_API_KEY
```

## Code Style

### General Guidelines

- **TypeScript**: Use TypeScript for type safety
- **Formatting**: Prettier with 2-space indentation
- **Linting**: ESLint with recommended rules
- **Imports**: Absolute imports preferred for components
- **File Naming**: kebab-case for files, PascalCase for components

### Frontend (`ui/`)

- **Framework**: React.js with functional components
- **Styling**: ShaeCN implementations
- **State Management**: React hooks and context
- **API Communication**: Axios for HTTP requests
- **Maps Integration**: Google Maps JavaScript API

### Backend (`service/`)

- **Framework**: Node.js with Express
- **Architecture**: RESTful API design
- **Data Format**: JSON for all API responses
- **Error Handling**: Consistent error response format
- **CORS**: Configured for frontend communication

## Business Logic

### Core Business Flow

1. **User Input**: Natural language location query
2. **Request Processing**: Frontend sends to API Gateway
3. **LLM Processing**: OpenWebUI interprets user intent
4. **Structured Output**: Generate location search parameters
5. **Google Maps Query**: Search for relevant locations
6. **Response Processing**: Format and return results
7. **Visual Display**: Show on interactive map

### API Endpoints

- `POST /api/search` - Main location search (Steps 1-7)
- `GET /api/locations/{place_id}` - Detailed location info
- `GET /api/nearby` - Proximity-based discovery
- `GET /api/health` - Service status check

### Business Cases

- **Conversational Discovery**: "Find good coffee shops near the university"
- **Intent-Based Search**: "Where can I get late night food?"
- **Area Exploration**: "What's interesting around Bandung city center?"
- **Specific Business Discovery**: "Ramen restaurant with good reviews near Turangga"

## Development Guidelines

### Adding New Features

1. **API Changes**: Update `docs/api-contract.md` with business case
2. **Frontend Components**: Follow React best practices
3. **Backend Services**: Maintain RESTful design principles
4. **Documentation**: Update README.md if needed

### External Service Integration

- **Google Maps API**: Handle rate limits and error scenarios
- **OpenWebUI**: Implement retry logic for LLM failures
- **Error Handling**: Always provide fallback responses

### Security Considerations

- **API Keys**: Never commit API keys to repository
- **Input Validation**: Validate all user inputs on backend
- **CORS**: Only allow frontend origin in production
- **Rate Limiting**: Implement appropriate rate limiting

## File Structure Reference

```
ai-location-finder/
├── ui/                     # Frontend React application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── service/                # Backend API services
│   ├── api-gateway/
│   ├── openwebui-integration/
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── architecture-diagram.png
│   └── api-contract.md     # Business process documentation
└── README.md              # Project overview and setup
```
