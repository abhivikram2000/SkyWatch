import { useState, useEffect } from 'react'
import { WiDaySunny, WiHumidity, WiStrongWind, WiBarometer, WiThermometer, WiSunrise, WiSunset } from 'react-icons/wi'
import { AiOutlineStar, AiFillStar } from 'react-icons/ai'
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  Link,
  Drawer,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  WbSunny as SunnyIcon,
  Air as AirIcon,
  Speed as SpeedIcon,
  Opacity as OpacityIcon,
  Map as MapIcon,
  Thermostat as ThermostatIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Cloud as CloudIcon,
  GitHub as GitHubIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom'
import './App.css'
import About from './pages/About'

interface WeatherData {
  temperature: number;
  windSpeed: number;
  humidity: number;
  pressure: number;
  latitude: number;
  longitude: number;
  daily: {
    time: string[];
    temperature_max: number[];
    temperature_min: number[];
    weathercode: number[];
  };
  sunrise: string;
  sunset: string;
  airQuality: {
    pm2_5: number;
    pm10: number;
    nitrogen_dioxide: number;
    aqi_us: number;
  };
}

interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

// Add this new interface for weather codes
interface WeatherCode {
  icon: JSX.Element;
  label: string;
}

interface FavoriteLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Add AQI level interface
interface AQILevel {
  level: string;
  color: string;
  description: string;
}

function App() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState<GeocodingResult | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Add theme state
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');

  // Add theme persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem('weatherAppTheme');
    if (savedTheme) {
      setMode(savedTheme as 'light' | 'dark');
    }
  }, []);

  // Update theme handler to include persistence
  const handleThemeChange = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    localStorage.setItem('weatherAppTheme', newMode);
  };

  // Add effect to update body styles when theme changes
  useEffect(() => {
    document.body.style.backgroundColor = mode === 'dark' ? '#1a1a1a' : '#f6f6f6';
    document.body.style.color = mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)';
    // Add a class to body for additional theme-specific styles
    document.body.className = mode;
  }, [mode]);

  // Create theme with light/dark variants
  const themeWithMode = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#646cff' : '#535bf2',
      },
      background: {
        default: mode === 'dark' ? '#1a1a1a' : '#f6f6f6',
        paper: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      },
      text: {
        primary: mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
        secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      },
    },
    typography: {
      fontFamily: "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: mode === 'dark' 
              ? 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
              : 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.01))',
            backdropFilter: 'blur(10px)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  });

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('weatherFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Geocoding function to get coordinates from city name
  const searchCity = async (cityName: string) => {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`
      );
      const data = await response.json();
      
      if (!data.results?.length) {
        throw new Error('City not found');
      }
      
      return data.results[0];
    } catch (err) {
      throw new Error('Failed to find city');
    }
  };

  // Add weather code mapping function
  const getWeatherInfo = (code: number): WeatherCode => {
    switch (code) {
      case 0:
        return { icon: <WiDaySunny />, label: 'Clear sky' };
      case 1:
      case 2:
      case 3:
        return { icon: <WiDaySunny />, label: 'Partly cloudy' };
      case 45:
      case 48:
        return { icon: <WiDaySunny />, label: 'Foggy' };
      case 51:
      case 53:
      case 55:
        return { icon: <WiDaySunny />, label: 'Drizzle' };
      case 61:
      case 63:
      case 65:
        return { icon: <WiDaySunny />, label: 'Rain' };
      case 71:
      case 73:
      case 75:
        return { icon: <WiDaySunny />, label: 'Snow' };
      case 77:
        return { icon: <WiDaySunny />, label: 'Snow grains' };
      case 80:
      case 81:
      case 82:
        return { icon: <WiDaySunny />, label: 'Rain showers' };
      case 85:
      case 86:
        return { icon: <WiDaySunny />, label: 'Snow showers' };
      case 95:
        return { icon: <WiDaySunny />, label: 'Thunderstorm' };
      case 96:
      case 99:
        return { icon: <WiDaySunny />, label: 'Thunderstorm with hail' };
      default:
        return { icon: <WiDaySunny />, label: 'Unknown' };
    }
  };

  // Add AQI level helper function
  const getAQILevel = (aqi: number): AQILevel => {
    if (aqi <= 50) {
      return { level: 'Good', color: '#00e400', description: 'Air quality is satisfactory' };
    } else if (aqi <= 100) {
      return { level: 'Moderate', color: '#ffff00', description: 'Air quality is acceptable' };
    } else if (aqi <= 150) {
      return { level: 'Unhealthy for Sensitive Groups', color: '#ff7e00', description: 'Members of sensitive groups may experience health effects' };
    } else if (aqi <= 200) {
      return { level: 'Unhealthy', color: '#ff0000', description: 'Everyone may begin to experience health effects' };
    } else if (aqi <= 300) {
      return { level: 'Very Unhealthy', color: '#8f3f97', description: 'Health warnings of emergency conditions' };
    } else {
      return { level: 'Hazardous', color: '#7e0023', description: 'Health alert: everyone may experience serious health effects' };
    }
  };

  // Update the fetch weather function to include daily forecast
  const fetchWeather = async (latitude: number, longitude: number) => {
    try {
      const [weatherResponse, airQualityResponse] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure` +
          `&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
          `&timezone=auto`
        ),
        fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}` +
          `&current=pm10,pm2_5,nitrogen_dioxide,us_aqi`
        )
      ]);

      if (!weatherResponse.ok || !airQualityResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const weatherData = await weatherResponse.json();
      const airQualityData = await airQualityResponse.json();

      return {
        temperature: weatherData.current.temperature_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        humidity: weatherData.current.relative_humidity_2m,
        pressure: weatherData.current.surface_pressure,
        latitude,
        longitude,
        sunrise: weatherData.daily.sunrise[0],
        sunset: weatherData.daily.sunset[0],
        airQuality: {
          pm2_5: airQualityData.current.pm2_5,
          pm10: airQualityData.current.pm10,
          nitrogen_dioxide: airQualityData.current.nitrogen_dioxide,
          aqi_us: airQualityData.current.us_aqi
        },
        daily: {
          time: weatherData.daily.time,
          temperature_max: weatherData.daily.temperature_2m_max,
          temperature_min: weatherData.daily.temperature_2m_min,
          weathercode: weatherData.daily.weathercode,
        }
      };
    } catch (err) {
      throw new Error('Failed to fetch weather data');
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const cityData = await searchCity(search);
      setCity(cityData);
      const weather = await fetchWeather(cityData.latitude, cityData.longitude);
      setWeatherData(weather);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const convertTemp = (temp: number) => {
    return unit === 'celsius' ? temp : (temp * 9/5) + 32;
  };

  // Add a function to format dates
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Add time formatting function
  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isLocationFavorite = (location: GeocodingResult) => {
    return favorites.some(
      fav => fav.latitude === location.latitude && 
             fav.longitude === location.longitude
    );
  };

  const toggleFavorite = (location: GeocodingResult) => {
    if (isLocationFavorite(location)) {
      setFavorites(favorites.filter(
        fav => fav.latitude !== location.latitude || 
               fav.longitude !== location.longitude
      ));
    } else {
      setFavorites([...favorites, {
        name: location.name,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude
      }]);
    }
  };

  const handleFavoriteSelect = async (favorite: FavoriteLocation) => {
    setSearch(`${favorite.name}, ${favorite.country}`);
    setIsLoading(true);
    setError(null);

    try {
      setCity({
        name: favorite.name,
        country: favorite.country,
        latitude: favorite.latitude,
        longitude: favorite.longitude
      });
      const weather = await fetchWeather(favorite.latitude, favorite.longitude);
      setWeatherData(weather);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Add this component for the navigation drawer
  const NavigationDrawer = () => (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 240,
          background: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`
        }
      }}
    >
      <List>
        <ListItem 
          component={RouterLink} 
          to="/"
          onClick={() => setDrawerOpen(false)}
          sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
        >
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem 
          component={RouterLink} 
          to="/about"
          onClick={() => setDrawerOpen(false)}
          sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
        >
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText primary="About" />
        </ListItem>
      </List>
    </Drawer>
  );

  return (
    <Router>
      <ThemeProvider theme={themeWithMode}>
        <Box sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Container maxWidth="lg" sx={{ flex: 1 }}>
            <AppBar 
              position="static" 
              color="transparent" 
              elevation={0}
              sx={{
                backdropFilter: 'blur(10px)',
                borderBottom: 1,
                borderColor: 'divider'
              }}
            >
              <Toolbar>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={() => setDrawerOpen(true)}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <CloudIcon 
                  sx={{ 
                    mr: 2, 
                    fontSize: '2rem',
                    color: 'primary.main',
                    animation: 'float 3s ease-in-out infinite'
                  }} 
                />
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    flexGrow: 1,
                    fontWeight: 600,
                    background: mode === 'dark' 
                      ? 'linear-gradient(45deg, #646cff, #9089fc)'
                      : 'linear-gradient(45deg, #535bf2, #7b74fc)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    textShadow: '0 0 30px rgba(100, 108, 255, 0.3)'
                  }}
                >
                  SkyWatch
                </Typography>
                <IconButton 
                  onClick={handleThemeChange}
                  color="inherit"
                  sx={{ 
                    mr: 2,
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'rotate(30deg)'
                    }
                  }}
                >
                  {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                <ToggleButtonGroup
                  value={unit}
                  exclusive
                  onChange={(_, newUnit) => newUnit && setUnit(newUnit)}
                  aria-label="temperature unit"
                >
                  <ToggleButton value="celsius">°C</ToggleButton>
                  <ToggleButton value="fahrenheit">°F</ToggleButton>
                </ToggleButtonGroup>
              </Toolbar>
            </AppBar>

            <NavigationDrawer />

            <Routes>
              <Route path="/" element={
                <>
                  <Box sx={{ my: 4 }}>
                    <Paper sx={{ p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs>
                          <TextField
                            fullWidth
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Enter city name"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            InputProps={{
                              endAdornment: (
                                <IconButton onClick={handleSearch}>
                                  <SearchIcon />
                                </IconButton>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>

                      {favorites.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            Favorite Locations
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            {favorites.map((favorite) => (
                              <Chip
                                key={`${favorite.latitude}-${favorite.longitude}`}
                                icon={<StarIcon />}
                                label={`${favorite.name}, ${favorite.country}`}
                                onClick={() => handleFavoriteSelect(favorite)}
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Paper>
                  </Box>

                  {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                      <CircularProgress />
                    </Box>
                  )}
                  
                  {error && (
                    <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
                  )}

                  {weatherData && city && (
                    <Card sx={{ mb: 4, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Typography variant="h4">{city.name}, {city.country}</Typography>
                          <IconButton
                            onClick={() => toggleFavorite(city)}
                            color="primary"
                            title={isLocationFavorite(city) ? "Remove from favorites" : "Add to favorites"}
                          >
                            {isLocationFavorite(city) ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                        </Box>

                        <Box sx={{ textAlign: 'center', my: 4 }}>
                          <Typography variant="h2" component="div">
                            <ThermostatIcon sx={{ fontSize: 'inherit', verticalAlign: 'middle' }} />
                            {Math.round(convertTemp(weatherData.temperature))}°{unit === 'celsius' ? 'C' : 'F'}
                          </Typography>
                        </Box>

                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          <Grid item xs={12} md={4}>
                            <List>
                              <ListItem>
                                <ListItemIcon>
                                  <OpacityIcon />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Humidity"
                                  secondary={`${Math.round(weatherData.humidity)}%`}
                                />
                              </ListItem>
                            </List>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <List>
                              <ListItem>
                                <ListItemIcon>
                                  <AirIcon />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Wind Speed"
                                  secondary={`${Math.round(weatherData.windSpeed)} m/s`}
                                />
                              </ListItem>
                            </List>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <List>
                              <ListItem>
                                <ListItemIcon>
                                  <SpeedIcon />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Pressure"
                                  secondary={`${Math.round(weatherData.pressure)} hPa`}
                                />
                              </ListItem>
                            </List>
                          </Grid>
                        </Grid>

                        {/* Sun Times Section */}
                        <Grid container spacing={3} sx={{ my: 4 }}>
                          <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.02)' }}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <WiSunrise style={{ fontSize: '2.5rem', color: '#ffd700' }} />
                                <Box>
                                  <Typography variant="body2" color="text.secondary">Sunrise</Typography>
                                  <Typography variant="h6">{formatTime(weatherData.sunrise)}</Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.02)' }}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <WiSunset style={{ fontSize: '2.5rem', color: '#ff8c00' }} />
                                <Box>
                                  <Typography variant="body2" color="text.secondary">Sunset</Typography>
                                  <Typography variant="h6">{formatTime(weatherData.sunset)}</Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                        </Grid>

                        {/* Air Quality Section */}
                        <Box sx={{ my: 4 }}>
                          <Typography variant="h5" gutterBottom>Air Quality</Typography>
                          <Paper 
                            sx={{ 
                              p: 3, 
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: 2,
                              borderColor: getAQILevel(weatherData.airQuality.aqi_us).color,
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <Stack spacing={2}>
                              <Box>
                                <Typography variant="h4" component="div" gutterBottom>
                                  {getAQILevel(weatherData.airQuality.aqi_us).level}
                                  <Typography 
                                    component="span" 
                                    sx={{ ml: 2, opacity: 0.7 }}
                                  >
                                    AQI: {weatherData.airQuality.aqi_us}
                                  </Typography>
                                </Typography>
                                <Typography color="text.secondary">
                                  {getAQILevel(weatherData.airQuality.aqi_us).description}
                                </Typography>
                              </Box>
                              
                              <Grid container spacing={2}>
                                {[
                                  { label: 'PM2.5', value: `${weatherData.airQuality.pm2_5.toFixed(1)} µg/m³` },
                                  { label: 'PM10', value: `${weatherData.airQuality.pm10.toFixed(1)} µg/m³` },
                                  { label: 'NO₂', value: `${weatherData.airQuality.nitrogen_dioxide.toFixed(1)} µg/m³` }
                                ].map((item) => (
                                  <Grid item xs={12} sm={4} key={item.label}>
                                    <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.05)' }}>
                                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                                      <Typography variant="body1">{item.value}</Typography>
                                    </Paper>
                                  </Grid>
                                ))}
                              </Grid>
                            </Stack>
                          </Paper>
                        </Box>

                {/* Weather Map Section */}
                <Box sx={{ my: 4 }}>
                  <Typography variant="h5" gutterBottom>Weather Map</Typography>
                  <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.02)' }}>
                    <Button
                      variant="contained"
                      startIcon={<MapIcon />}
                      onClick={() => setShowMap(!showMap)}
                      sx={{ mb: 2 }}
                    >
                      {showMap ? 'Hide Map' : 'Show Map'}
                    </Button>
                    
                    {showMap && (
                      <Box 
                        sx={{ 
                          mt: 2, 
                          borderRadius: 2, 
                          overflow: 'hidden',
                          height: 400,
                          '@media (max-width: 600px)': {
                            height: 300
                          }
                        }}
                      >
                        <iframe
                          title="Weather Map"
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          src={`https://embed.windy.com/embed2.html?lat=${weatherData.latitude}&lon=${weatherData.longitude}&zoom=8&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`}
                        />
                      </Box>
                    )}
                  </Paper>
                </Box>

                {/* Forecast Section */}
                <Box sx={{ my: 4 }}>
                  <Typography variant="h5" gutterBottom>5-Day Forecast</Typography>
                  <Grid container spacing={2}>
                    {weatherData.daily.time.slice(1, 6).map((date, index) => (
                      <Grid item xs={12} sm={6} md={2.4} key={date}>
                        <Paper 
                          sx={{ 
                            p: 2, 
                            background: 'rgba(255, 255, 255, 0.02)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)'
                            }
                          }}
                        >
                          <Typography variant="subtitle2" color="text.secondary">
                            {formatDate(date)}
                          </Typography>
                          <Box sx={{ fontSize: '2.5rem', color: 'primary.main' }}>
                            {getWeatherInfo(weatherData.daily.weathercode[index + 1]).icon}
                          </Box>
                          <Stack direction="row" spacing={2}>
                            <Typography variant="h6">
                              {Math.round(convertTemp(weatherData.daily.temperature_max[index + 1]))}°
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                              {Math.round(convertTemp(weatherData.daily.temperature_min[index + 1]))}°
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {getWeatherInfo(weatherData.daily.weathercode[index + 1]).label}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Coordinates */}
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  align="center"
                  sx={{ mt: 4 }}
                >
                  Lat: {weatherData.latitude.toFixed(2)}° | Lon: {weatherData.longitude.toFixed(2)}°
                </Typography>
              </CardContent>
            </Card>
          )}
                </>
              } />
              <Route path="/about" element={<About />} />
            </Routes>
          </Container>

          <Box
            component="footer"
            sx={{
              py: 3,
              px: 2,
              mt: 'auto',
              backgroundColor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Container maxWidth="lg">
              <Grid container spacing={3} alignItems="center" justifyContent="space-between">
                <Grid item xs={12} sm="auto">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CloudIcon 
                      sx={{ 
                        fontSize: '1.2rem',
                        color: 'primary.main'
                      }} 
                    />
                    <Typography variant="body2" color="text.secondary">
                      © {new Date().getFullYear()} SkyWatch. All rights reserved.
                    </Typography>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} sm="auto">
                  <Stack 
                    direction="row" 
                    spacing={3} 
                    alignItems="center"
                    justifyContent={{ xs: 'center', sm: 'flex-end' }}
                  >
                    <Link
                      href="https://open-meteo.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        color: 'text.secondary',
                        textDecoration: 'none',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      <Typography variant="body2">
                        Powered by Open-Meteo
                      </Typography>
                    </Link>
                    <Link
                      href="https://github.com/yourusername/skywatch"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        textDecoration: 'none',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      <GitHubIcon sx={{ fontSize: '1.2rem' }} />
                      <Typography variant="body2">
                        Source Code
                      </Typography>
                    </Link>
                  </Stack>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Box>
      </ThemeProvider>
    </Router>
  );
}

export default App;
