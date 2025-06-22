# Weather Reminder API Server

A Node.js Express server that provides intelligent weather reminders based on temperature, humidity, and wind conditions.

## Features

- 🌡️ Temperature-based reminders (very cold to extremely hot)
- 💧 Humidity consideration
- 💨 Wind speed alerts
- 📱 RESTful API for mobile app integration
- 🚨 Different alert levels (info, warning, danger)
- 💡 Practical tips for each weather condition

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Base URL
```
http://localhost:3000
```

### 1. Get Server Info
```
GET /
```

### 2. Get Temperature Reminder (Query Parameters)
```
GET /api/reminder?temperature=25&humidity=60&windSpeed=10
```

**Parameters:**
- `temperature` (required): Temperature in Celsius
- `humidity` (optional): Humidity percentage (default: 50)
- `windSpeed` (optional): Wind speed in km/h (default: 0)

### 3. Get Temperature Reminder (POST)
```
POST /api/reminder
Content-Type: application/json

{
  "temperature": 25,
  "humidity": 60,
  "windSpeed": 10,
  "location": "New York"
}
```

### 4. Health Check
```
GET /health
```

## Temperature Ranges

| Temperature | Category | Alert Level |
|-------------|----------|-------------|
| ≤ -10°C | Very Cold | Danger |
| -10°C to 5°C | Cold | Warning |
| 5°C to 15°C | Cool | Info |
| 15°C to 25°C | Warm | Info |
| 25°C to 30°C | Hot | Warning |
| 30°C to 35°C | Very Hot | Warning |
| > 35°C | Extreme Heat | Danger |

## Response Format

```json
{
  "temperature": 25,
  "humidity": 60,
  "windSpeed": 10,
  "reminder": {
    "message": "☀️ Hot Weather - Stay Cool!",
    "type": "warning",
    "icon": "sunny",
    "tips": [
      "Wear light, breathable clothing",
      "Stay hydrated - drink plenty of water",
      "Seek shade during peak hours",
      "Use sunscreen SPF 30+"
    ]
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Usage with React Native App

The server is designed to work with the Weather App. It provides contextual reminders based on the current weather conditions fetched from OpenWeatherMap API.

## Port Configuration

Default port: 3000

To use a different port, set the `PORT` environment variable:
```bash
PORT=8080 npm start
``` 