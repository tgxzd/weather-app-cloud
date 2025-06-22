const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Temperature thresholds
const TEMPERATURE_THRESHOLDS = {
  VERY_COLD: -10,
  COLD: 5,
  COOL: 15,
  WARM: 25,
  HOT: 30,
  VERY_HOT: 35
};

// Function to get reminder based on temperature
const getTemperatureReminder = (temperature, humidity = 50, windSpeed = 0) => {
  let reminder = {
    message: "",
    type: "info", // info, warning, danger
    icon: "thermometer",
    tips: []
  };

  if (temperature <= TEMPERATURE_THRESHOLDS.VERY_COLD) {
    reminder = {
      message: "🥶 Extremely Cold Weather Alert!",
      type: "danger",
      icon: "snow",
      tips: [
        "Dress in multiple layers",
        "Wear warm gloves and a hat",
        "Limit time outdoors",
        "Stay hydrated with warm drinks",
        "Check on elderly neighbors"
      ]
    };
  } else if (temperature <= TEMPERATURE_THRESHOLDS.COLD) {
    reminder = {
      message: "❄️ Cold Weather - Bundle Up!",
      type: "warning",
      icon: "snow",
      tips: [
        "Wear a warm jacket",
        "Don't forget gloves and scarf",
        "Warm up your car before driving",
        "Drink hot beverages"
      ]
    };
  } else if (temperature <= TEMPERATURE_THRESHOLDS.COOL) {
    reminder = {
      message: "🧥 Cool Weather - Light Jacket Recommended",
      type: "info",
      icon: "cloud",
      tips: [
        "Wear a light jacket or sweater",
        "Perfect weather for outdoor activities",
        "Great time for a walk"
      ]
    };
  } else if (temperature <= TEMPERATURE_THRESHOLDS.WARM) {
    reminder = {
      message: "🌤️ Pleasant Weather - Perfect Day!",
      type: "info",
      icon: "partly-sunny",
      tips: [
        "Comfortable temperature for all activities",
        "Great day to spend time outdoors",
        "Light clothing recommended"
      ]
    };
  } else if (temperature <= TEMPERATURE_THRESHOLDS.HOT) {
    reminder = {
      message: "☀️ Hot Weather - Stay Cool!",
      type: "warning",
      icon: "sunny",
      tips: [
        "Wear light, breathable clothing",
        "Stay hydrated - drink plenty of water",
        "Seek shade during peak hours",
        "Use sunscreen SPF 30+"
      ]
    };
  } else if (temperature <= TEMPERATURE_THRESHOLDS.VERY_HOT) {
    reminder = {
      message: "🔥 Very Hot Weather - Take Precautions!",
      type: "warning",
      icon: "sunny",
      tips: [
        "Avoid outdoor activities during 10AM-4PM",
        "Drink water frequently",
        "Wear light-colored, loose clothing",
        "Stay in air-conditioned areas",
        "Watch for heat exhaustion symptoms"
      ]
    };
  } else {
    reminder = {
      message: "🌡️ Extreme Heat Warning!",
      type: "danger",
      icon: "sunny",
      tips: [
        "Stay indoors during peak hours",
        "Drink water every 15-20 minutes",
        "Never leave anyone in a parked car",
        "Seek immediate medical attention for heat illness",
        "Check on vulnerable family members"
      ]
    };
  }

  // Add humidity-based tips
  if (humidity > 80) {
    reminder.tips.push("High humidity - expect it to feel hotter than actual temperature");
  } else if (humidity < 30) {
    reminder.tips.push("Low humidity - use moisturizer and stay hydrated");
  }

  // Add wind-based tips
  if (windSpeed > 20) {
    reminder.tips.push("Strong winds - secure loose items outdoors");
  }

  return reminder;
};

// API Routes
app.get('/', (req, res) => {
  res.json({
    message: "Weather Reminder API Server",
    status: "running",
    endpoints: {
      "GET /api/reminder": "Get temperature-based reminder",
      "POST /api/reminder": "Get reminder with weather data"
    }
  });
});

// GET endpoint for simple temperature reminder
app.get('/api/reminder', (req, res) => {
  const { temperature, humidity, windSpeed } = req.query;
  
  if (!temperature) {
    return res.status(400).json({
      error: "Temperature parameter is required",
      example: "/api/reminder?temperature=25&humidity=60&windSpeed=10"
    });
  }

  const temp = parseFloat(temperature);
  const hum = humidity ? parseFloat(humidity) : 50;
  const wind = windSpeed ? parseFloat(windSpeed) : 0;

  if (isNaN(temp)) {
    return res.status(400).json({
      error: "Invalid temperature value"
    });
  }

  const reminder = getTemperatureReminder(temp, hum, wind);
  
  res.json({
    temperature: temp,
    humidity: hum,
    windSpeed: wind,
    reminder: reminder,
    timestamp: new Date().toISOString()
  });
});

// POST endpoint for weather data
app.post('/api/reminder', (req, res) => {
  const { temperature, humidity, windSpeed, location } = req.body;
  
  if (temperature === undefined) {
    return res.status(400).json({
      error: "Temperature is required in request body"
    });
  }

  const temp = parseFloat(temperature);
  const hum = humidity ? parseFloat(humidity) : 50;
  const wind = windSpeed ? parseFloat(windSpeed) : 0;

  if (isNaN(temp)) {
    return res.status(400).json({
      error: "Invalid temperature value"
    });
  }

  const reminder = getTemperatureReminder(temp, hum, wind);
  
  res.json({
    location: location || "Unknown",
    temperature: temp,
    humidity: hum,
    windSpeed: wind,
    reminder: reminder,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: [
      "GET /",
      "GET /api/reminder",
      "POST /api/reminder",
      "GET /health"
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🌤️  Weather Reminder Server running on port ${PORT}`);
  console.log(`📡 API available at: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`💡 Example: http://localhost:${PORT}/api/reminder?temperature=25`);
}); 