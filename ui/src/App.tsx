import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Box,
  Paper,
} from "@mui/material";
import { LocationOn as LocationIcon } from "@mui/icons-material";
import { AppProvider } from "./context/AppContext";
import SearchBar from "./components/SearchBar";
import LocationList from "./components/LocationList";
import MapComponent from "./components/MapComponent";

// Create Material-UI theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Box
          sx={{
            flexGrow: 1,
            minHeight: "100vh",
            backgroundColor: "background.default",
          }}
        >
          {/* Header */}
          <AppBar position="static" elevation={2}>
            <Toolbar>
              <LocationIcon sx={{ mr: 2 }} />
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, fontWeight: 600 }}
              >
                AI Location Finder
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Main Content */}
          <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Search Section */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                textAlign="center"
                sx={{ mb: 3 }}
              >
                Find Locations with AI
              </Typography>
              <Typography
                variant="body1"
                textAlign="center"
                color="text.secondary"
                sx={{ mb: 4 }}
              >
                Ask in natural language and get intelligent location
                recommendations
              </Typography>
              <SearchBar />
            </Box>

            {/* Results Section */}
            <Grid container spacing={3}>
              {/* Left Panel - Location List */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 2, height: "fit-content", minHeight: 400 }}>
                  <LocationList />
                </Paper>
              </Grid>

              {/* Right Panel - Map */}
              <Grid size={{ xs: 12, md: 8 }}>
                <MapComponent />
              </Grid>
            </Grid>

            {/* Footer Info */}
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Powered by AI and Google Maps • Built with React, TypeScript,
                and Material-UI
              </Typography>
            </Box>
          </Container>
        </Box>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
