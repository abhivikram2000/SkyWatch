# SkyWatch - Weather Application

A modern, feature-rich weather application built with React, TypeScript, and Material-UI that provides real-time weather information and forecasts.

## Features

- 🌡️ Real-time weather data including temperature, wind speed, humidity, and pressure
- 🌅 Sunrise and sunset times
- 💨 Air quality information (PM2.5, PM10, NO2, AQI)
- 📱 Responsive design for both desktop and mobile devices
- 🌓 Dark/Light theme support with system preference detection
- ⭐ Favorite locations management with local storage
- 🌍 Location search with geocoding
- 📊 Daily weather forecasts
- 🌡️ Temperature unit conversion (Celsius/Fahrenheit)

## Tech Stack

- React 18.3
- TypeScript
- Vite
- Material-UI (MUI) v6
- React Router DOM v7
- React Icons
- Axios

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd skywatch
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

## API Integration

This application uses the following APIs:
- Open-Meteo API for weather data
- Open-Meteo Geocoding API for location search

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
