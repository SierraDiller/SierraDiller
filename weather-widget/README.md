# 🌤️ Weather Widget

A beautiful, functional weather widget that displays current weather conditions for the user's location with a clean, modern interface and smooth animations.

## 🎯 Features

### Core Features
- **Current Weather Display** - Temperature, conditions, humidity, wind speed, pressure, visibility
- **Location Detection** - Auto-detect user's location using geolocation
- **Location Search** - Search for any city worldwide
- **Temperature Units** - Toggle between Fahrenheit and Celsius
- **5-Day Forecast** - Daily weather predictions
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop

### Enhanced Features
- **Real-time Updates** - Refresh weather data with one click
- **Error Handling** - Graceful error messages and retry options
- **Loading States** - Smooth loading animations and skeleton screens
- **Weather Icons** - Animated weather condition icons
- **Last Updated** - Timestamp of when data was last refreshed

## 🛠 Tech Stack

- **HTML5** - Semantic structure
- **CSS3** - Modern styling with flexbox/grid and animations
- **Vanilla JavaScript** - API calls, geolocation, DOM manipulation
- **External API** - [OpenWeatherMap](https://openweathermap.org) (free tier)
- **Weather Icons** - Emoji-based weather representations

## 🚀 Quick Start

### 1. Get API Key
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from your account dashboard
4. Replace `'your_api_key_here'` in `script.js` with your actual API key

### 2. Run the Project
1. **Option A**: Open `index.html` directly in your browser
2. **Option B**: Use a local server (recommended):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
3. Navigate to `http://localhost:8000` in your browser

### 3. Allow Location Access
- When prompted, allow the browser to access your location
- The widget will automatically load weather for your current location

## 📁 Project Structure

```
weather-widget/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── script.js           # JavaScript functionality
├── assets/             # Additional assets (icons, backgrounds)
└── README.md           # This file
```

## 🎨 Design Highlights

- **Color Palette**: Sky blues (#4A90E2, #87CEEB) with warm accents
- **Typography**: Inter font family for clean readability
- **Layout**: Card-based design with generous whitespace
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach

## 🔧 API Integration

The app uses the [OpenWeatherMap API](https://openweathermap.org/api):

### Current Weather Endpoint
```
GET https://api.openweathermap.org/data/2.5/weather
```

### Parameters
- `q`: City name or coordinates
- `units`: `metric` (Celsius) or `imperial` (Fahrenheit)
- `appid`: Your API key

### Sample Response
```json
{
  "name": "New York",
  "main": {
    "temp": 72,
    "feels_like": 74,
    "humidity": 65,
    "pressure": 1012
  },
  "weather": [{
    "description": "clear sky",
    "icon": "01d"
  }],
  "wind": {
    "speed": 5.2
  },
  "visibility": 10000
}
```

## 📱 Responsive Design

### Mobile (320px - 768px)
- Single column layout
- Stacked weather information
- Touch-friendly buttons
- Simplified forecast display

### Tablet (768px - 1024px)
- Two-column layout for forecast
- Larger weather icons
- Enhanced search interface

### Desktop (1024px+)
- Multi-column layout
- Hover effects and animations
- Detailed forecast information

## 🚨 Error Handling

### Geolocation Errors
- Permission denied → Show manual search option
- Timeout → Use default location (New York)
- Unavailable → Fallback to IP-based location

### API Errors
- Network failure → Show retry button
- Rate limit → Show friendly message
- Invalid location → Suggest alternatives

### User Feedback
- Loading spinners for API calls
- Success messages for actions
- Error messages with recovery options

## 🎯 Success Criteria Met

- ✅ Displays current weather for user's location
- ✅ Shows temperature, condition, humidity, wind speed
- ✅ Allows location search and manual input
- ✅ Toggles between Fahrenheit and Celsius
- ✅ Responsive design works on all devices
- ✅ Handles errors gracefully with user feedback
- ✅ Smooth animations and transitions
- ✅ Clean, modern UI design
- ✅ 5-day forecast functionality

## 🌟 Future Enhancements

- **Weather Alerts** - Display severe weather warnings
- **Background Changes** - Dynamic backgrounds based on weather/time
- **Weather Animations** - More sophisticated weather condition animations
- **Location Favorites** - Save and manage favorite locations
- **Weather History** - Track temperature trends over time
- **Share Weather** - Share current conditions on social media
- **Weather Maps** - Interactive weather maps
- **Air Quality** - Air quality index display

## 🔑 API Key Setup

### Step 1: Get Your API Key
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Click "Sign Up" and create a free account
3. Go to your account dashboard
4. Copy your API key

### Step 2: Add Your API Key
1. Open `script.js`
2. Find line 2: `const API_KEY = 'your_api_key_here';`
3. Replace `'your_api_key_here'` with your actual API key
4. Save the file

### Step 3: Test the App
1. Open `index.html` in your browser
2. Allow location access when prompted
3. The weather should load automatically

## 📋 Testing Checklist

- [ ] Geolocation works on different browsers
- [ ] API calls succeed and fail gracefully
- [ ] Temperature conversion is accurate
- [ ] Search functionality finds locations
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Error messages are helpful and actionable
- [ ] Loading states provide good user feedback
- [ ] Animations are smooth and not jarring
- [ ] Forecast data displays correctly
- [ ] Unit toggle works properly

## 🤝 Contributing

Feel free to fork this project and add your own features! This is a great starting point for learning modern web development with APIs.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Resources

- [OpenWeatherMap API Documentation](https://openweathermap.org/api)
- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [JavaScript Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

**Built with ❤️ for learning and weather enthusiasts** 