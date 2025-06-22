// Configuration
const API_KEY = 'your_api_key_here'; // Replace with your OpenWeatherMap API key
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Check if API key is set
const isApiKeySet = API_KEY !== 'your_api_key_here';

// Demo weather data for when API key is not set
const demoWeatherData = {
    'New York, US': {
        name: 'New York',
        sys: { country: 'US' },
        main: { temp: 72, feels_like: 74, humidity: 65, pressure: 1012 },
        weather: [{ description: 'clear sky', icon: '01d' }],
        wind: { speed: 5.2 },
        visibility: 10000
    },
    'Nashville, US': {
        name: 'Nashville',
        sys: { country: 'US' },
        main: { temp: 78, feels_like: 80, humidity: 70, pressure: 1015 },
        weather: [{ description: 'partly cloudy', icon: '02d' }],
        wind: { speed: 3.1 },
        visibility: 10000
    },
    'Knoxville, US': {
        name: 'Knoxville',
        sys: { country: 'US' },
        main: { temp: 75, feels_like: 77, humidity: 68, pressure: 1013 },
        weather: [{ description: 'scattered clouds', icon: '03d' }],
        wind: { speed: 4.5 },
        visibility: 10000
    }
};

// DOM elements
const locationName = document.getElementById('locationName');
const locationDetails = document.getElementById('locationDetails');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const weatherCard = document.getElementById('weatherCard');
const loadingState = document.getElementById('loadingState');
const weatherContent = document.getElementById('weatherContent');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const refreshBtn = document.getElementById('refreshBtn');
const unitToggleBtn = document.getElementById('unitToggleBtn');
const locationBtn = document.getElementById('locationBtn');
const forecastContainer = document.getElementById('forecastContainer');
const lastUpdated = document.getElementById('lastUpdated');

// Weather display elements
const weatherIcon = document.getElementById('weatherIcon');
const tempValue = document.getElementById('tempValue');
const tempUnit = document.getElementById('tempUnit');
const feelsLike = document.getElementById('feelsLike');
const feelsLikeUnit = document.getElementById('feelsLikeUnit');
const weatherDescription = document.getElementById('weatherDescription');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');

// App state
let currentLocation = null;
let currentUnits = 'imperial'; // 'imperial' for Fahrenheit, 'metric' for Celsius
let currentWeatherData = null;
let locationTimeout = null;

// Popular cities for autocomplete
const popularCities = [
    // Major US Cities
    'New York, US', 'Los Angeles, US', 'Chicago, US', 'Houston, US', 'Phoenix, US',
    'Philadelphia, US', 'San Antonio, US', 'San Diego, US', 'Dallas, US', 'San Jose, US',
    'Austin, US', 'Jacksonville, US', 'Fort Worth, US', 'Columbus, US', 'Charlotte, US',
    'San Francisco, US', 'Indianapolis, US', 'Seattle, US', 'Denver, US', 'Washington, US',
    'Boston, US', 'El Paso, US', 'Nashville, US', 'Detroit, US', 'Oklahoma City, US',
    'Portland, US', 'Las Vegas, US', 'Memphis, US', 'Louisville, US', 'Baltimore, US',
    'Milwaukee, US', 'Albuquerque, US', 'Tucson, US', 'Fresno, US', 'Sacramento, US',
    'Atlanta, US', 'Kansas City, US', 'Long Beach, US', 'Colorado Springs, US', 'Miami, US',
    'Raleigh, US', 'Omaha, US', 'Minneapolis, US', 'Cleveland, US', 'Tulsa, US',
    'Wichita, US', 'New Orleans, US', 'Arlington, US', 'Tampa, US', 'Oakland, US',
    'Knoxville, US', 'Cincinnati, US', 'Pittsburgh, US', 'St. Louis, US', 'Anchorage, US',
    
    // International Cities
    'London, GB', 'Tokyo, JP', 'Paris, FR', 'Sydney, AU', 'Toronto, CA',
    'Vancouver, CA', 'Montreal, CA', 'Calgary, CA', 'Edmonton, CA',
    'Berlin, DE', 'Munich, DE', 'Hamburg, DE', 'Cologne, DE', 'Frankfurt, DE',
    'Madrid, ES', 'Barcelona, ES', 'Valencia, ES', 'Seville, ES', 'Bilbao, ES',
    'Rome, IT', 'Milan, IT', 'Naples, IT', 'Turin, IT', 'Florence, IT'
];

// Weather icons mapping
const weatherIcons = {
    '01d': '☀️', // clear sky day
    '01n': '🌙', // clear sky night
    '02d': '⛅', // few clouds day
    '02n': '☁️', // few clouds night
    '03d': '☁️', // scattered clouds
    '03n': '☁️',
    '04d': '☁️', // broken clouds
    '04n': '☁️',
    '09d': '🌧️', // shower rain
    '09n': '🌧️',
    '10d': '🌦️', // rain day
    '10n': '🌧️', // rain night
    '11d': '⛈️', // thunderstorm
    '11n': '⛈️',
    '13d': '🌨️', // snow
    '13n': '🌨️',
    '50d': '🌫️', // mist
    '50n': '🌫️'
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeApp();
});

// Setup event listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Add autocomplete functionality
    searchInput.addEventListener('input', handleAutocomplete);
    searchInput.addEventListener('focus', showAutocomplete);
    searchInput.addEventListener('blur', hideAutocomplete);
    
    refreshBtn.addEventListener('click', refreshWeather);
    unitToggleBtn.addEventListener('click', toggleUnits);
    locationBtn.addEventListener('click', getCurrentLocation);
    retryBtn.addEventListener('click', initializeApp);
}

// Initialize the app
async function initializeApp() {
    showLoading();
    
    try {
        // Try to get user's location with 15-second timeout
        await getCurrentLocationWithTimeout();
    } catch (error) {
        console.log('Geolocation failed or timed out, showing manual input');
        showManualLocationInput();
    }
}

// Get current location with 15-second timeout
async function getCurrentLocationWithTimeout() {
    if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
    }

    return new Promise((resolve, reject) => {
        // Set 15-second timeout
        locationTimeout = setTimeout(() => {
            reject(new Error('Location detection timed out'));
        }, 15000);

        const options = {
            timeout: 15000, // 15 seconds
            enableHighAccuracy: false, // Faster, less accurate
            maximumAge: 300000 // 5 minutes cache
        };

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                clearTimeout(locationTimeout);
                try {
                    const { latitude, longitude } = position.coords;
                    console.log('Location obtained:', latitude, longitude);
                    currentLocation = { lat: latitude, lon: longitude };
                    await fetchWeatherByCoords(latitude, longitude);
                    resolve();
                } catch (error) {
                    console.error('Error fetching weather for location:', error);
                    reject(error);
                }
            },
            (error) => {
                clearTimeout(locationTimeout);
                console.error('Geolocation error:', error);
                reject(new Error('Unable to get your location'));
            },
            options
        );
    });
}

// Show manual location input
function showManualLocationInput() {
    loadingState.innerHTML = `
        <div class="manual-location">
            <h3>📍 Enter Your Location</h3>
            <p>Location detection took too long. Please enter your city:</p>
            <div class="search-container" style="margin: 20px auto; max-width: 300px;">
                <input type="text" id="manualSearchInput" class="search-input" placeholder="Type your city name..." autocomplete="off">
                <button id="manualSearchBtn" class="search-btn">🔍</button>
            </div>
            <div id="autocompleteList" class="autocomplete-list"></div>
            <p style="font-size: 0.9rem; color: #666; margin-top: 15px;">
                Or try: <button onclick="quickCity('New York')" class="quick-city-btn">New York</button> | 
                <button onclick="quickCity('Nashville')" class="quick-city-btn">Nashville</button> | 
                <button onclick="quickCity('Knoxville')" class="quick-city-btn">Knoxville</button>
            </p>
        </div>
    `;
    
    // Add event listeners for manual search
    const manualSearchInput = document.getElementById('manualSearchInput');
    const manualSearchBtn = document.getElementById('manualSearchBtn');
    
    manualSearchInput.addEventListener('input', handleAutocomplete);
    manualSearchInput.addEventListener('focus', showAutocomplete);
    manualSearchInput.addEventListener('blur', hideAutocomplete);
    manualSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleManualSearch();
    });
    
    manualSearchBtn.addEventListener('click', handleManualSearch);
}

// Handle manual search
async function handleManualSearch() {
    const input = document.getElementById('manualSearchInput');
    const query = input.value.trim();
    if (!query) return;

    showLoading();
    try {
        await fetchWeatherByCity(query);
        input.value = '';
    } catch (error) {
        showError('City not found. Please try a different location.');
    }
}

// Quick city selection
function quickCity(city) {
    showLoading();
    fetchWeatherByCity(city);
}

// Handle autocomplete
function handleAutocomplete() {
    const query = searchInput.value.trim().toLowerCase();
    const autocompleteList = document.getElementById('autocompleteList');
    
    if (!query) {
        hideAutocomplete();
        return;
    }
    
    const matches = popularCities.filter(city => 
        city.toLowerCase().includes(query)
    ).slice(0, 5);
    
    if (matches.length > 0) {
        showAutocomplete(matches);
    } else {
        hideAutocomplete();
    }
}

// Show autocomplete list
function showAutocomplete(matches = null) {
    const autocompleteList = document.getElementById('autocompleteList');
    const query = searchInput.value.trim().toLowerCase();
    
    if (!matches) {
        matches = popularCities.filter(city => 
            city.toLowerCase().includes(query)
        ).slice(0, 5);
    }
    
    if (matches.length > 0) {
        autocompleteList.innerHTML = matches.map(city => 
            `<div class="autocomplete-item" onclick="selectCity('${city}')">${city}</div>`
        ).join('');
        autocompleteList.style.display = 'block';
    }
}

// Hide autocomplete list
function hideAutocomplete() {
    setTimeout(() => {
        const autocompleteList = document.getElementById('autocompleteList');
        if (autocompleteList) {
            autocompleteList.style.display = 'none';
        }
    }, 200);
}

// Select city from autocomplete
function selectCity(city) {
    searchInput.value = city;
    hideAutocomplete();
    handleSearch();
}

// Get current location using geolocation (original function)
async function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by this browser. Please enter your city manually.');
        return;
    }

    showLoading();
    
    return new Promise((resolve, reject) => {
        const options = {
            timeout: 10000, // 10 seconds
            enableHighAccuracy: false, // Faster, less accurate
            maximumAge: 300000 // 5 minutes cache
        };

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    console.log('Location obtained:', latitude, longitude);
                    currentLocation = { lat: latitude, lon: longitude };
                    await fetchWeatherByCoords(latitude, longitude);
                    resolve();
                } catch (error) {
                    console.error('Error fetching weather for location:', error);
                    showError('Got your location but failed to fetch weather. Please try searching for your city.');
                    reject(error);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                let errorMessage = 'Unable to get your location. ';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please allow location access or enter your city manually.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information unavailable. Please enter your city manually.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out. Please enter your city manually.';
                        break;
                    default:
                        errorMessage += 'Please enter your city manually.';
                }
                
                showError(errorMessage);
                reject(new Error(errorMessage));
            },
            options
        );
    });
}

// Handle search functionality
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    showLoading();
    try {
        await fetchWeatherByCity(query);
        searchInput.value = '';
    } catch (error) {
        showError('City not found. Please try a different location.');
    }
}

// Fetch weather by city name
async function fetchWeatherByCity(city) {
    console.log('Fetching weather for:', city);
    console.log('API Key:', API_KEY);
    
    // Check if API key is set
    if (!isApiKeySet) {
        console.log('Using demo mode');
        // Demo mode - use sample data
        const demoKey = `${city}, US`;
        if (demoWeatherData[demoKey]) {
            const data = demoWeatherData[demoKey];
            currentWeatherData = data;
            updateWeatherDisplay(data);
            showNotification('Demo mode: Using sample weather data. Get a real API key for live weather!', 'info');
            return;
        } else {
            throw new Error(`Demo mode: ${city} not available. Get an API key for all cities.`);
        }
    }
    
    console.log('Using real API mode');
    // Real API mode - try different formats for the city name
    const cityFormats = [
        city, // Original input
        `${city}, US`, // Add US country code
        `${city}, USA`, // Alternative US format
        city.replace(/\s+/g, ' ').trim(), // Clean up spaces
        // Case variations
        city.toLowerCase(),
        city.toUpperCase(),
        city.charAt(0).toUpperCase() + city.slice(1).toLowerCase(), // Title case
        `${city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()}, US`
    ];
    
    let lastError = null;
    
    for (const cityFormat of cityFormats) {
        try {
            const url = `${API_BASE_URL}/weather?q=${encodeURIComponent(cityFormat)}&units=${currentUnits}&appid=${API_KEY}`;
            console.log('Trying URL:', url);
            const response = await fetch(url);
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Success! Weather data:', data);
                currentWeatherData = data;
                updateWeatherDisplay(data);
                await fetchForecast(cityFormat);
                return; // Success, exit function
            } else {
                const errorData = await response.json();
                console.log('API Error:', errorData);
                lastError = errorData.message || 'City not found';
            }
        } catch (error) {
            console.log('Fetch error:', error);
            lastError = error.message;
        }
    }
    
    // If all formats failed, throw the last error
    throw new Error(`City not found: ${city}. Try adding state (e.g., "Knoxville, TN") or country (e.g., "Nashville, US")`);
}

// Reverse geocode coordinates to get location name
async function getLocationName(lat, lon) {
    try {
        // Use a free reverse geocoding service
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
        const data = await response.json();
        
        if (data.display_name) {
            // Extract city and state/country from the full address
            const parts = data.display_name.split(', ');
            const city = parts[0];
            const state = parts[1] || parts[parts.length - 1]; // State or country
            return `${city}, ${state}`;
        }
        return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
}

// Show cute location detection popup
function showLocationPopup(locationName) {
    // Remove any existing popup
    const existingPopup = document.querySelector('.location-popup');
    const existingOverlay = document.querySelector('.popup-overlay');
    if (existingPopup) existingPopup.remove();
    if (existingOverlay) existingOverlay.remove();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    document.body.appendChild(overlay);
    
    // Determine location theme and icon
    const { theme, icon } = getLocationTheme(locationName);
    
    // Create popup
    const popup = document.createElement('div');
    popup.className = `location-popup ${theme}-theme`;
    popup.innerHTML = `
        <div class="location-popup-icon">${icon}</div>
        <div class="location-popup-title">📍 Location Detected!</div>
        <div class="location-popup-location">${locationName}</div>
        <div class="location-popup-message">Fetching your weather right now!</div>
        <div class="location-popup-loading">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        popup.classList.add('hide');
        overlay.classList.add('hide');
        setTimeout(() => {
            popup.remove();
            overlay.remove();
        }, 400);
    }, 3000);
}

// Get location-specific theme and icon
function getLocationTheme(locationName) {
    const location = locationName.toLowerCase();
    
    // Beach locations
    if (location.includes('beach') || location.includes('coast') || location.includes('ocean') || 
        location.includes('miami') || location.includes('san diego') || location.includes('honolulu')) {
        return { theme: 'beach', icon: '🏖️' };
    }
    
    // Mountain locations
    if (location.includes('mountain') || location.includes('denver') || location.includes('aspen') || 
        location.includes('vail') || location.includes('park city')) {
        return { theme: 'mountain', icon: '🏔️' };
    }
    
    // Forest locations
    if (location.includes('forest') || location.includes('wood') || location.includes('park') || 
        location.includes('seattle') || location.includes('portland')) {
        return { theme: 'forest', icon: '🌲' };
    }
    
    // Desert locations
    if (location.includes('desert') || location.includes('phoenix') || location.includes('las vegas') || 
        location.includes('tucson') || location.includes('albuquerque')) {
        return { theme: 'desert', icon: '🏜️' };
    }
    
    // Default city theme
    return { theme: 'city', icon: '🏙️' };
}

// Get fallback images for demo (using placeholder images)
function getFallbackImages(locationName) {
    const location = locationName.toLowerCase();
    
    // Define image sets for different location types
    const imageSets = {
        'city': [
            'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=400&h=300&fit=crop'
        ],
        'beach': [
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
        ],
        'mountain': [
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=400&h=300&fit=crop'
        ],
        'forest': [
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
        ],
        'desert': [
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
        ]
    };
    
    // Determine location type
    let imageType = 'city'; // default
    
    if (location.includes('beach') || location.includes('coast') || location.includes('ocean') || 
        location.includes('miami') || location.includes('san diego') || location.includes('honolulu')) {
        imageType = 'beach';
    } else if (location.includes('mountain') || location.includes('denver') || location.includes('aspen')) {
        imageType = 'mountain';
    } else if (location.includes('forest') || location.includes('wood') || location.includes('park') || 
               location.includes('seattle') || location.includes('portland')) {
        imageType = 'forest';
    } else if (location.includes('desert') || location.includes('phoenix') || location.includes('las vegas')) {
        imageType = 'desert';
    }
    
    // Get the image set and shuffle it
    const imageSet = imageSets[imageType] || imageSets.city;
    return shuffleArray(imageSet);
}

// Shuffle array function (Fisher-Yates algorithm)
function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy to avoid mutating original
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Show location background collage
async function showLocationBackground(locationName) {
    // Remove any existing background
    const existingBackground = document.querySelector('.background-collage');
    const existingLoading = document.querySelector('.background-loading');
    if (existingBackground) existingBackground.remove();
    if (existingLoading) existingLoading.remove();
    
    // Show loading message
    const loading = document.createElement('div');
    loading.className = 'background-loading show';
    loading.textContent = `Loading beautiful images of ${locationName}...`;
    document.body.appendChild(loading);
    
    try {
        // Get location-specific images from Unsplash
        const images = await fetchLocationImages(locationName);
        
        // Create background collage
        const collage = document.createElement('div');
        collage.className = 'background-collage';
        
        // Randomly select 9 images and shuffle their order
        const selectedImages = shuffleArray(images).slice(0, 9);
        
        // Add images to collage with random positioning
        selectedImages.forEach((imageUrl, index) => {
            const img = document.createElement('img');
            img.className = 'collage-image';
            img.src = imageUrl;
            img.alt = locationName;
            img.loading = 'lazy';
            
            // Add random rotation and scale for variety
            const randomRotation = (Math.random() - 0.5) * 10; // -5 to +5 degrees
            const randomScale = 0.95 + Math.random() * 0.1; // 0.95 to 1.05
            img.style.transform = `rotate(${randomRotation}deg) scale(${randomScale})`;
            
            collage.appendChild(img);
        });
        
        document.body.appendChild(collage);
        
        // Show collage with animation
        setTimeout(() => {
            collage.classList.add('show');
            loading.classList.remove('show');
            setTimeout(() => loading.remove(), 300);
        }, 500);
        
    } catch (error) {
        console.error('Failed to load background images:', error);
        loading.textContent = 'Background images unavailable';
        setTimeout(() => loading.remove(), 2000);
    }
}

// Fetch location-specific images from Unsplash
async function fetchLocationImages(locationName) {
    // Use Unsplash API to get location-specific images
    const searchTerm = encodeURIComponent(locationName);
    const url = `https://api.unsplash.com/search/photos?query=${searchTerm}&orientation=landscape&per_page=9&client_id=YOUR_UNSPLASH_ACCESS_KEY`;
    
    try {
        // For demo purposes, use a fallback approach since we don't have Unsplash API key
        // In production, you would use the actual Unsplash API
        return getFallbackImages(locationName);
    } catch (error) {
        console.error('Unsplash API error:', error);
        return getFallbackImages(locationName);
    }
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
    console.log('Fetching weather by coordinates:', lat, lon);
    
    // Get the actual location name
    const locationName = await getLocationName(lat, lon);
    console.log('Detected location:', locationName);
    
    // Show cute location popup
    showLocationPopup(locationName);
    
    // Show location background collage
    showLocationBackground(locationName);
    
    // Check if API key is set
    if (!isApiKeySet) {
        console.log('Using demo mode for coordinates');
        // Demo mode - use sample data but show actual location
        const data = demoWeatherData['New York, US'];
        // Override the location name with the detected location
        data.name = locationName.split(',')[0]; // Just the city name
        data.sys = { country: locationName.split(',')[1]?.trim() || 'US' };
        currentWeatherData = data;
        updateWeatherDisplay(data);
        showNotification(`Demo mode: Location detected as ${locationName}. Using sample weather data. Get a real API key for live weather!`, 'info');
        return;
    }
    
    console.log('Using real API for coordinates');
    const url = `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${currentUnits}&appid=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Unable to fetch weather data');
    }
    
    const data = await response.json();
    currentWeatherData = data;
    updateWeatherDisplay(data);
    await fetchForecast(`${lat},${lon}`);
}

// Fetch 5-day forecast
async function fetchForecast(location) {
    try {
        const url = `${API_BASE_URL}/forecast?q=${encodeURIComponent(location)}&units=${currentUnits}&appid=${API_KEY}`;
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            updateForecastDisplay(data);
        }
    } catch (error) {
        console.error('Forecast fetch error:', error);
        // Don't show error for forecast, just log it
    }
}

// Update weather display
function updateWeatherDisplay(data) {
    // Update location
    locationName.textContent = data.name;
    locationDetails.textContent = `${data.sys.country || ''}`;
    
    // Update temperature
    const temp = Math.round(data.main.temp);
    const feelsLikeTemp = Math.round(data.main.feels_like);
    const unit = currentUnits === 'imperial' ? '°F' : '°C';
    
    tempValue.textContent = temp;
    tempUnit.textContent = unit;
    feelsLike.textContent = feelsLikeTemp;
    feelsLikeUnit.textContent = unit;
    
    // Update weather description and icon
    weatherDescription.textContent = data.weather[0].description;
    weatherIcon.textContent = weatherIcons[data.weather[0].icon] || '🌤️';
    
    // Update weather details
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${Math.round(data.wind.speed)} ${currentUnits === 'imperial' ? 'mph' : 'm/s'}`;
    pressure.textContent = `${data.main.pressure} hPa`;
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    
    // Update last updated time
    lastUpdated.textContent = new Date().toLocaleTimeString();
    
    // Show weather content
    showWeatherContent();
}

// Update forecast display
function updateForecastDisplay(data) {
    // Group forecast by day and get daily averages
    const dailyForecasts = groupForecastByDay(data.list);
    
    // Clear existing forecast
    forecastContainer.innerHTML = '';
    
    // Create forecast cards
    dailyForecasts.slice(1, 6).forEach(day => {
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.temp);
        const unit = currentUnits === 'imperial' ? '°F' : '°C';
        const icon = weatherIcons[day.icon] || '🌤️';
        
        forecastDay.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-temp">${temp}${unit}</div>
        `;
        
        forecastContainer.appendChild(forecastDay);
    });
}

// Group forecast data by day
function groupForecastByDay(forecastList) {
    const dailyData = {};
    
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        
        if (!dailyData[date]) {
            dailyData[date] = {
                date: date,
                temps: [],
                icons: []
            };
        }
        
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].icons.push(item.weather[0].icon);
    });
    
    // Calculate daily averages
    return Object.values(dailyData).map(day => ({
        date: day.date,
        temp: day.temps.reduce((a, b) => a + b, 0) / day.temps.length,
        icon: day.icons[Math.floor(day.icons.length / 2)] // Use middle icon of the day
    }));
}

// Refresh weather data
async function refreshWeather() {
    if (!currentLocation && !currentWeatherData) {
        await initializeApp();
        return;
    }
    
    showLoading();
    try {
        if (currentLocation) {
            await fetchWeatherByCoords(currentLocation.lat, currentLocation.lon);
        } else if (currentWeatherData) {
            await fetchWeatherByCity(currentWeatherData.name);
        }
    } catch (error) {
        showError('Failed to refresh weather data');
    }
}

// Toggle temperature units
async function toggleUnits() {
    currentUnits = currentUnits === 'imperial' ? 'metric' : 'imperial';
    
    if (currentWeatherData) {
        showLoading();
        try {
            if (currentLocation) {
                await fetchWeatherByCoords(currentLocation.lat, currentLocation.lon);
            } else {
                await fetchWeatherByCity(currentWeatherData.name);
            }
        } catch (error) {
            showError('Failed to update units');
        }
    }
}

// Show loading state
function showLoading() {
    loadingState.style.display = 'block';
    weatherContent.style.display = 'none';
    errorState.style.display = 'none';
}

// Show weather content
function showWeatherContent() {
    loadingState.style.display = 'none';
    weatherContent.style.display = 'block';
    errorState.style.display = 'none';
}

// Show error state
function showError(message) {
    loadingState.style.display = 'none';
    weatherContent.style.display = 'none';
    errorState.style.display = 'block';
    errorMessage.textContent = message;
}

// Add notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    if (type === 'success') {
        notification.style.background = '#48bb78';
    } else if (type === 'error') {
        notification.style.background = '#f56565';
    } else {
        notification.style.background = '#4299e1';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 