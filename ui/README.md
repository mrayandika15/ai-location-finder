# AI Location Finder - Frontend

A modern React application built with Vite, TypeScript, and Material-UI for intelligent location discovery.

## 🚀 Features

- **Natural Language Search**: Enter queries like "coffee shops near university"
- **Material-UI Design**: Modern, responsive UI components
- **TypeScript**: Full type safety and better development experience
- **Google Maps Integration**: Ready for interactive map display
- **Real-time Search**: Dynamic location results with API integration

## 🛠️ Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Material-UI (MUI)** for UI components
- **Axios** for API communication
- **Google Maps API** (ready for integration)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── SearchBar.tsx    # Search input component
│   ├── LocationCard.tsx # Location display card
│   ├── LocationList.tsx # List of search results
│   └── MapComponent.tsx # Map placeholder (Google Maps)
├── context/             # React context for state management
│   └── AppContext.tsx   # Global app state
├── services/            # API integration
│   └── api.ts          # Backend API client
├── types/              # TypeScript type definitions
│   └── index.ts        # All app types
├── utils/              # Utility functions
│   └── index.ts        # Helper functions
└── App.tsx             # Main application component
```

## 🔧 Setup and Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment Setup:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Available Scripts:**
   ```bash
   npm start       # Start development server
   npm run dev     # Alternative dev command
   npm run build   # Build for production
   npm run preview # Preview production build
   npm run lint    # Run ESLint
   npm run lint:fix # Fix ESLint errors
   ```

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Development settings
VITE_NODE_ENV=development
```

## 🗺️ Google Maps Integration

The app includes a placeholder for Google Maps integration. To enable:

1. Get a Google Maps JavaScript API key
2. Add it to your `.env` file as `VITE_GOOGLE_MAPS_API_KEY`
3. Update `MapComponent.tsx` to implement the Google Maps integration

## 🔌 API Integration

The app connects to the backend API at `/api/search` for location queries. Make sure the backend service is running on the configured port (default: 8000).

## 🏃‍♂️ Development

1. Start the development server:

   ```bash
   npm start
   ```

2. Open http://localhost:5173 in your browser

3. The app will hot-reload as you make changes

## 🏗️ Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🎨 Component Architecture

- **App.tsx**: Main layout with Material-UI theme
- **SearchBar**: Handles user input and API requests
- **LocationList**: Displays search results
- **LocationCard**: Individual location details
- **MapComponent**: Map visualization (placeholder)
- **AppContext**: Global state management

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile phones

## 🔧 Development Notes

- Uses Material-UI v7 with modern `size` prop for Grid components
- TypeScript strict mode enabled for better type safety
- ESLint configured with React and TypeScript rules
- Vite for fast HMR and optimized builds
