# AI Location Finder

An intelligent location discovery system that leverages Large Language Models (LLM) and Google Maps API to provide contextually relevant location recommendations based on natural language queries.

![AI Location Finder Architecture](/docs/architecture-diagram.png)

## 🚀 Project Overview

The AI Location Finder is a modern web application that transforms natural language location queries into actionable, map-based results. Users can simply ask questions like "Find ramen near Turangga" and receive intelligent location suggestions powered by AI and real-time map data.

## 🏗️ Architecture

The system follows a microservices architecture with clear separation of concerns:

### Components

1. **Frontend (User Interface)**

   - React-based web application
   - Interactive Google Maps integration
   - Real-time location display
   - User-friendly query interface

2. **API Gateway**

   - Central request orchestration
   - Route management and load balancing
   - Request/response transformation
   - Authentication and authorization layer

3. **OpenWebUI (LLM Interface)**

   - Large Language Model integration
   - Natural language processing
   - Query interpretation and context understanding
   - Structured location data generation

4. **Google Maps API Integration**
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

### Frontend

- **React.js** - Modern UI framework
- **Google Maps JavaScript API** - Interactive maps
- **CSS3/SCSS** - Styling and responsive design
- **Axios** - HTTP client for API communication

### Backend

- **Node.js/Express** - API Gateway server
- **RESTful APIs** - Service communication
- **JSON** - Data exchange format

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

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## 📝 Configuration

### Environment Variables

```env
# Google Maps Configuration
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# OpenWebUI Configuration
OPENWEBUI_API_URL=your_openwebui_endpoint
OPENWEBUI_API_KEY=your_openwebui_api_key

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 🔧 API Endpoints

### Core Endpoints

- `POST /api/search` - Process natural language location queries
- `GET /api/locations/:id` - Get detailed location information
- `GET /api/nearby` - Find nearby places based on coordinates
- `GET /api/health` - System health check

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Maps Platform for location services
- OpenWebUI for LLM integration
- React community for frontend tools
- Contributors and testers

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ by [Your Name] | [Your GitHub Profile]
