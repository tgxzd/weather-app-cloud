import Button from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WeatherData {
  name: string;
  country: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  icon: string;
  forecast: {
    date: string;
    temp: number;
    description: string;
    icon: string;
  }[];
}

interface WeatherReminder {
  message: string;
  type: 'info' | 'warning' | 'danger';
  icon: string;
  tips: string[];
}

export default function Forecast() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherReminder, setWeatherReminder] = useState<WeatherReminder | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeatherReminder = async (temperature: number, humidity: number, windSpeed: number, locationName: string) => {
    try {
      const REMINDER_API_URL = process.env.EXPO_PUBLIC_REMINDER_API_URL;
      console.log('🌐 Environment variable value:', REMINDER_API_URL);
      console.log('🔗 Trying to connect to:', `${REMINDER_API_URL}/api/reminder`);
      
      const reminderResponse = await axios.post(`${REMINDER_API_URL}/api/reminder`, {
        temperature,
        humidity,
        windSpeed,
        location: locationName
      }, {
        timeout: 5000, // 5 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      setWeatherReminder(reminderResponse.data.reminder);
      console.log('Successfully fetched reminder:', reminderResponse.data.reminder.message);
    } catch (error: any) {
      console.error('Reminder API Error:', error.message);
      console.error('Error details:', {
        code: error.code,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Set a fallback reminder when API is unavailable
      setWeatherReminder({
        message: "📱 Weather reminder service unavailable",
        type: "info",
        icon: "information-circle",
        tips: [
          "Check current temperature and dress accordingly",
          "Stay hydrated and protect yourself from extreme weather",
          "Weather reminder server may be offline"
        ]
      });
    }
  };

  const fetchWeatherData = async () => {
    if (!location.trim()) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }

    setLoading(true);
    try {
      const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
      
      // Get current weather
      const currentWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
      );

      // Get 5-day forecast
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=metric`
      );

      const current = currentWeatherResponse.data;
      const forecast = forecastResponse.data;

      // Process forecast data (get one forecast per day)
      const dailyForecast = forecast.list
        .filter((_: any, index: number) => index % 8 === 0) // Every 8th item (24 hours)
        .slice(0, 5)
        .map((item: any) => ({
          date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          temp: Math.round(item.main.temp),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
        }));

      const weatherData = {
        name: current.name,
        country: current.sys.country,
        temperature: Math.round(current.main.temp),
        description: current.weather[0].description,
        humidity: current.main.humidity,
        windSpeed: Math.round(current.wind.speed * 3.6), // Convert m/s to km/h
        feelsLike: Math.round(current.main.feels_like),
        icon: current.weather[0].icon,
        forecast: dailyForecast,
      };

      setWeatherData(weatherData);

      // Fetch weather reminder
      await fetchWeatherReminder(
        weatherData.temperature,
        weatherData.humidity,
        weatherData.windSpeed,
        `${weatherData.name}, ${weatherData.country}`
      );
    } catch (error: any) {
      console.error('Weather API Error:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to fetch weather data. Please check the location name and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      '01d': 'sunny', '01n': 'moon',
      '02d': 'partly-sunny', '02n': 'cloudy-night',
      '03d': 'cloud', '03n': 'cloud',
      '04d': 'cloudy', '04n': 'cloudy',
      '09d': 'rainy', '09n': 'rainy',
      '10d': 'rainy', '10n': 'rainy',
      '11d': 'thunderstorm', '11n': 'thunderstorm',
      '13d': 'snow', '13n': 'snow',
      '50d': 'eye', '50n': 'eye',
    };
    return iconMap[iconCode] || 'partly-sunny';
  };

  return (
    <LinearGradient
      colors={['#050f1f', '#0a1428', '#050f1f']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(1000).springify()}>
            <View style={styles.header}>
              <Button
                title="← Back"
                onPress={() => router.back()}
                style={styles.backButton}
                primary={false}
              />
              <Text style={styles.title}>Weather Forecast</Text>
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.duration(1000).delay(300)}
            style={styles.searchContainer}
          >
            <TextInput
              style={styles.input}
              placeholder="Enter location name (e.g., London, New York)"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
            />
            <Button
              title={loading ? "Loading..." : "Get Weather"}
              onPress={fetchWeatherData}
              disabled={loading}
              style={styles.searchButton}
            />
          </Animated.View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text style={styles.loadingText}>Fetching weather data...</Text>
            </View>
          )}

          {weatherData && (
            <Animated.View 
              entering={FadeInUp.duration(800).delay(500)}
              style={styles.weatherContainer}
            >
              {/* Current Weather Card */}
              <View style={styles.currentWeatherCard}>
                <View style={styles.currentWeatherHeader}>
                  <Text style={styles.locationText}>
                    {weatherData.name}, {weatherData.country}
                  </Text>
                  <Ionicons 
                    name={getWeatherIcon(weatherData.icon)} 
                    size={60} 
                    color="#FFD700" 
                  />
                </View>
                
                <Text style={styles.temperature}>{weatherData.temperature}°C</Text>
                <Text style={styles.description}>
                  {weatherData.description.replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
                
                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <Ionicons name="thermometer" size={20} color="#FFD700" />
                    <Text style={styles.detailText}>Feels like {weatherData.feelsLike}°C</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="water" size={20} color="#FFD700" />
                    <Text style={styles.detailText}>Humidity {weatherData.humidity}%</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="leaf" size={20} color="#FFD700" />
                    <Text style={styles.detailText}>Wind {weatherData.windSpeed} km/h</Text>
                  </View>
                </View>
              </View>

              {/* Weather Reminder Card */}
              {weatherReminder && (
                <View style={[
                  styles.reminderCard,
                  weatherReminder.type === 'danger' && styles.dangerCard,
                  weatherReminder.type === 'warning' && styles.warningCard,
                  weatherReminder.type === 'info' && styles.infoCard
                ]}>
                  <View style={styles.reminderHeader}>
                    <Text style={styles.reminderMessage}>{weatherReminder.message}</Text>
                    <Ionicons 
                      name={weatherReminder.type === 'danger' ? 'warning' : weatherReminder.type === 'warning' ? 'alert-circle' : 'information-circle'}
                      size={24} 
                      color={weatherReminder.type === 'danger' ? '#FF6B6B' : weatherReminder.type === 'warning' ? '#FFB366' : '#66B3FF'} 
                    />
                  </View>
                  
                  <Text style={styles.reminderTipsTitle}>💡 Tips & Recommendations:</Text>
                  {weatherReminder.tips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Text style={styles.tipBullet}>•</Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 5-Day Forecast */}
              <View style={styles.forecastCard}>
                <Text style={styles.forecastTitle}>5-Day Forecast</Text>
                {weatherData.forecast.map((day, index) => (
                  <View key={index} style={styles.forecastItem}>
                    <Text style={styles.forecastDate}>{day.date}</Text>
                    <View style={styles.forecastMiddle}>
                      <Ionicons 
                        name={getWeatherIcon(day.icon)} 
                        size={24} 
                        color="#FFD700" 
                      />
                      <Text style={styles.forecastDescription}>
                        {day.description.replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </View>
                    <Text style={styles.forecastTemp}>{day.temp}°C</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  backButton: {
    width: 80,
    marginRight: 10,
  },
  title: {
    flex: 1,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    color: 'white',
    fontFamily: 'PoppinsRegular',
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchButton: {
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'PoppinsRegular',
    fontSize: 16,
    marginTop: 10,
  },
  weatherContainer: {
    gap: 20,
  },
  currentWeatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  currentWeatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 18,
    color: 'white',
    flex: 1,
  },
  temperature: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 48,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 5,
  },
  description: {
    fontFamily: 'PoppinsRegular',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailsContainer: {
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  forecastCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  forecastTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  forecastDate: {
    fontFamily: 'PoppinsMedium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    width: 80,
  },
  forecastMiddle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  forecastDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  forecastTemp: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: '#FFD700',
    width: 50,
    textAlign: 'right',
  },
  reminderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dangerCard: {
    borderColor: 'rgba(255, 107, 107, 0.5)',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  warningCard: {
    borderColor: 'rgba(255, 179, 102, 0.5)',
    backgroundColor: 'rgba(255, 179, 102, 0.1)',
  },
  infoCard: {
    borderColor: 'rgba(102, 179, 255, 0.5)',
    backgroundColor: 'rgba(102, 179, 255, 0.1)',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  reminderMessage: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: 'white',
    flex: 1,
    marginRight: 10,
  },
  reminderTipsTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: '#FFD700',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    lineHeight: 20,
  },
}); 