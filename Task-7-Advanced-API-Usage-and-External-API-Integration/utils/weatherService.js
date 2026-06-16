const axios = require('axios');

// Stable string hash helper to generate consistent mock data for cities
const getCityHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
};

// Generates consistent mock weather data for a city name
const getMockWeather = (city) => {
    const cleanCity = city.trim();
    const hash = getCityHash(cleanCity);
    
    const conditions = ['Sunny', 'Partly Cloudy', 'Overcast', 'Light Rain', 'Heavy Thunderstorm', 'Clear Sky', 'Misty'];
    const icons = ['01d', '02d', '04d', '10d', '11d', '01d', '50d']; // OpenWeatherMap corresponding icon codes
    const countries = ['US', 'GB', 'IN', 'FR', 'DE', 'JP', 'CA', 'AU', 'BR', 'ZA'];

    const index = hash % conditions.length;
    const temp = (hash % 35) + (hash % 10) / 10; // e.g. 0 to 35.9 °C
    const humidity = 30 + (hash % 60); // 30% to 90%
    const windSpeed = 1.5 + ((hash % 150) / 10); // 1.5 to 16.5 m/s
    const country = countries[hash % countries.length];
    
    // Capitalize city name
    const cityName = cleanCity.charAt(0).toUpperCase() + cleanCity.slice(1);

    return {
        temp: Math.round(temp * 10) / 10,
        description: conditions[index],
        humidity: Math.round(humidity),
        windSpeed: Math.round(windSpeed * 10) / 10,
        icon: icons[index],
        country: country,
        cityName: cityName,
        isMock: true
    };
};

/**
 * Fetch weather from OpenWeatherMap or fall back to mock weather
 * @param {string} city - The city name to search for
 * @returns {Promise<object>} Unified weather metrics
 */
const fetchWeather = async (city) => {
    const apiKey = process.env.WEATHER_API_KEY;
    const isMockMode = !apiKey || apiKey === 'your_openweathermap_api_key_here' || apiKey.trim() === '';

    if (isMockMode) {
        console.log(`[WeatherService] Using Mock Fallback for city: "${city}" (No OpenWeatherMap key found)`);
        // Simulate a small delay for realistic network latency
        await new Promise(resolve => setTimeout(resolve, 300));
        return getMockWeather(city);
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
        const response = await axios.get(url);
        const { data } = response;
        
        return {
            temp: data.main.temp,
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            icon: data.weather[0].icon,
            country: data.sys.country,
            cityName: data.name,
            isMock: false
        };
    } catch (error) {
        console.error(`[WeatherService] OpenWeatherMap request failed: ${error.message}`);
        
        // Handle city not found explicitly
        if (error.response && error.response.status === 404) {
            throw new Error(`City "${city}" not found.`);
        }
        
        // Fallback to mock data with a warning if the API fails due to an invalid key or network issue
        console.warn(`[WeatherService] Falling back to Mock data due to external API error: ${error.message}`);
        return getMockWeather(city);
    }
};

module.exports = {
    fetchWeather
};
