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
├── ui/                     # Frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── service/                # Backend services
│   ├── api-gateway/
│   ├── openwebui-integration/
│   ├── package.json
│   └── ...
├── docs/
│   ├── architecture-diagram.png
│   └── api-contract.md
└── README.md
```

### Components

1. **Frontend (UI Folder)**

   - **Location**: `./ui/`
   - React-based web application
   - Interactive Google Maps integration
   - Real-time location display
   - User-friendly query interface

2. **Backend Services (Service Folder)**

   - **Location**: `./service/`
   - API Gateway for request orchestration
   - Route management and load balancing
   - Request/response transformation
   - Authentication and authorization layer

3. **OpenWebUI Integration**

   - **Location**: `./service/openwebui-integration/`
   - Large Language Model integration
   - Natural language processing
   - Query interpretation and context understanding
   - Structured location data generation

4. **Google Maps API Integration**
   - **Location**: `./service/api-gateway/`
   - Real-time location data
   - Geocoding and reverse geocoding
   - Place details and reviews
   - Map visualization services

## 🔄 Project Flow

### Step-by-Step Process

1. **User Input**: User enters a natural language query (e.g., "Find ramen near Turangga")

2. **Request Processing**: Frontend sends the user prompt to the API Gateway

3. **LLM Processing**: API Gateway forwards the request to OpenWebUI for natural language processing

4. **Prompt Analysis**: OpenWebUI processes the query to understand:

   - Location context
   - Business type/category
   - User preferences
   - Geographic constraints

5. **Structured Output**: LLM generates structured location parameters

6. **Google Maps Query**: API Gateway uses the structured data to query Google Maps API

7. **Location Validation**: System validates and enriches location data

8. **Map Integration**: Google Maps API returns relevant locations with details

9. **Response Processing**: Frontend processes the location data

10. **Visual Display**: User sees results on an interactive map with location markers

## 🛠️ Technology Stack

### Frontend (`./ui/`)

- **React.js** - Modern UI framework
- **Google Maps JavaScript API** - Interactive maps
- **CSS3/SCSS** - Styling and responsive design
- **Axios** - HTTP client for API communication
- **Vite/Create React App** - Build tooling
- **TypeScript** - Type safety (optional)

### Backend (`./service/`)

- **Node.js/Express** - API Gateway server
- **RESTful APIs** - Service communication
- **JSON** - Data exchange format
- **Cors** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

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
cd ../service
npm install
```

4. Set up environment variables:

```bash
# In the service directory
cp .env.example .env
# Edit .env with your API keys and configuration

# In the ui directory (if needed)
cd ../ui
cp .env.example .env
# Edit .env with frontend-specific configuration
```

5. Start the Backend Server:

```bash
cd ../service
npm run dev
```

6. Start the Frontend Development Server (in a new terminal):

```bash
cd ui
npm start
```

7. Open your browser and navigate to `http://localhost:3000` (frontend) and `http://localhost:8000` (backend API)

## 📝 Configuration

### Environment Variables

#### Backend Configuration (`./service/.env`)

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
FRONTEND_URL=http://localhost:3000
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

### Quick Reference

| Endpoint                    | Method | Description                               |
| --------------------------- | ------ | ----------------------------------------- |
| `/api/health`               | GET    | Health check and service status           |
| `/api/search`               | POST   | Process natural language location queries |
| `/api/locations/{place_id}` | GET    | Get detailed location information         |
| `/api/nearby`               | GET    | Find nearby places based on coordinates   |

### Development URLs

- **Frontend**: http://localhost:3000 (React development server)
- **Backend API**: http://localhost:8000 (Express server)
- **OpenWebUI**: http://localhost:3001 (if running locally)
- **API Documentation**: [./docs/api-contract.md](./docs/api-contract.md)
