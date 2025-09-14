# AI Location Finder

An intelligent location discovery system that leverages Large Language Models (LLM) and Google Maps API to provide contextually relevant location recommendations based on natural language queries.

![AI Location Finder Architecture](/docs/architecture-diagram.png)

## 🚀 Project Overview

The AI Location Finder is a modern web application that transforms natural language location queries into actionable, map-based results. Users can simply ask questions like "Find ramen near Turangga" and receive intelligent location suggestions powered by AI and real-time map data.

## 🏗️ Architecture

The system follows a microservices architecture with clear separation of concerns:

### Project Structure

```
ai-location-finder/
├── ui/                     # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   ├── store/         # State management (Zustand)
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── api/                    # Backend API services
│   ├── lib/               # Core libraries
│   │   ├── google-maps-client.js
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   ├── package.json
│   └── index.js
├── collections/           # API testing collections (Bruno)
├── docs/
│   ├── architecture-diagram.png
│   ├── api-contract.md
│   └── example/
└── README.md
```

### Components

1. **Frontend (UI Folder)**

   - **Location**: `./ui/`
   - React-based web application with TypeScript
   - Interactive Google Maps integration using @vis.gl/react-google-maps
   - Real-time location display with Material-UI components
   - Chat interface for natural language queries
   - State management with Zustand
   - Custom hooks for API communication and streaming

2. **Backend API Services (API Folder)**

   - **Location**: `./api/`
   - Express.js API server
   - Route management and request handling
   - OpenWebUI integration for LLM processing
   - Google Maps API integration
   - WebSocket support for real-time streaming
   - CORS configuration for frontend communication

3. **Google Maps API Integration**
   - **Location**: `./api/lib/google-maps-client.js`
   - Real-time location data
   - Geocoding and reverse geocoding
   - Place details and reviews
   - Places search functionality

## 🔄 Project Flow

### 8-Step Process (Based on Architecture Diagram)

1. **User Input**: User enters a natural language query (e.g., "Find ramen near Turangga") in the frontend chat interface

2. **System Prompt Creation**: Frontend processes the user prompt and creates a standardized system prompt for consistent LLM output

3. **LLM Request**: Frontend sends the system prompt to OpenWebUI for natural language processing

4. **Async Event Trigger**: OpenWebUI processes the query and triggers an asynchronous webhook event

5. **Stream Response**: OpenWebUI sends streaming response back to the frontend through the webhook

6. **Parse & Validate**: Frontend parses and validates the LLM's structured output to ensure it contains proper location search parameters

7. **API Gateway**: Frontend sends the parsed LLM output to the API Gateway (backend)

8. **Google Maps Query**: API Gateway formats the data into JSON and queries Google Maps API to retrieve relevant locations

### Result Processing

- **Location Data**: Google Maps API returns location details, coordinates, and business information
- **Map Visualization**: Frontend displays results on an interactive map with location markers
- **User Interaction**: Users can explore locations, view details, and get directions

## 🛠️ Technology Stack

### Frontend (`./ui/`)

- **React.js** - Modern UI framework with TypeScript
- **@vis.gl/react-google-maps** - Interactive Google Maps integration
- **Material-UI (@mui/material)** - Component library and styling
- **Zustand** - State management
- **Axios** - HTTP client for API communication
- **Vite** - Build tooling and development server
- **TypeScript** - Type safety and development experience
- **Socket.io-client** - Real-time communication
- **@tanstack/react-query** - Data fetching and caching

### Backend (`./api/`)

- **Node.js/Express** - API server
- **RESTful APIs** - Service communication
- **JSON** - Data exchange format
- **Cors** - Cross-origin resource sharing
- **Dotenv** - Environment variable management
- **Express-ws** - WebSocket support for streaming
- **@googlemaps/google-maps-services-js** - Google Maps API integration

### AI/ML

- **OpenWebUI** - LLM interface
- **Large Language Models** - Natural language processing
- **Prompt Engineering** - Query optimization

### External Services

- **Google Maps API** - Location and mapping services
- **Google Places API** - Business and place information
- **Geocoding API** - Address to coordinates conversion

## 🎯 Key Features

- **Natural Language Queries**: Ask for locations in plain English
- **Intelligent Processing**: AI understands context and intent
- **Real-time Results**: Live location data from Google Maps
- **Interactive Maps**: Visual exploration of suggested locations
- **Responsive Design**: Works seamlessly across devices
- **Scalable Architecture**: Microservices-based design

## 🚦 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Google Maps API key
- OpenWebUI setup
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ai-location-finder.git
cd ai-location-finder
```

2. Install Frontend Dependencies:

```bash
cd ui
npm install
```

3. Install Backend Dependencies:

```bash
cd ../api
npm install
```

4. Set up environment variables:

```bash
# In the api directory
cd ../api
cp env.example .env
# Edit .env with your API keys and configuration

# In the ui directory (if needed)
cd ../ui
cp .env.example .env
# Edit .env with frontend-specific configuration
```

5. Start the Backend Server:

```bash
cd ../api
npm run dev
```

6. Start the Frontend Development Server (in a new terminal):

```bash
cd ui
npm run dev
```

7. Open your browser and navigate to `http://localhost:5173` (frontend) and `http://localhost:8000` (backend API)

## 📝 Configuration

### Environment Variables

#### Backend Configuration (`./api/.env`)

```env
# Google Maps Configuration
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# OpenWebUI Configuration
OPENWEBUI_API_URL=your_openwebui_endpoint
OPENWEBUI_API_KEY=your_openwebui_api_key

# Server Configuration
PORT=8000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

#### Frontend Configuration (`./ui/.env`) - Optional

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:8000

# Google Maps API Key (if used in frontend)
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 🔧 API Documentation

For detailed API documentation including request/response formats, authentication, and examples, see:

📋 **[Complete API Contract Documentation](./docs/api-contract.md)**

### Development URLs

- **Frontend**: http://localhost:5173 (Vite development server)
- **Backend API**: http://localhost:8000 (Express server)
- **OpenWebUI**: http://localhost:8080 (if running locally)
- **API Documentation**: [./docs/api-contract.md](./docs/api-contract.md)
- **API Testing**: Use Bruno collections in `./collections/` folder
