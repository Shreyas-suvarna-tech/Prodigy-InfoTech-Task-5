#  Weather App

A clean, responsive **Weather Web Application** built with pure HTML, CSS, and JavaScript.
Fetches real-time weather data using the **OpenWeatherMap API** based on city search or device GPS location.

---

##  Features

- 🔍 **Search by City** — Get weather for any city worldwide
- 📍 **GPS Location** — Auto-detect and fetch your current location's weather
- 🌡️ **°C / °F Toggle** — Switch temperature units instantly
- 📊 **Current Weather Details:**
  - Temperature, Feels Like, High / Low
  - Weather condition with emoji icon
  - Humidity, Wind Speed & Direction
  - Pressure, Visibility, Cloud Cover
  - Sunrise & Sunset times
- 📅 **5-Day Forecast** — Daily high/low with weather icons
- 🌙 **Auto Dark Mode** — Detects system theme preference
- ⚡ **Smooth Animations** — Fade-in transitions on load
- 📱 **Fully Responsive** — Works on all screen sizes

---

## 📁 Project Structure

```
weather-app/
├── index.html       → Page structure (search bar, buttons, content)
├── style.css        → Styling (dark mode, grid layout, animations)
├── script.js        → Logic (API fetch, geolocation, rendering)
└── README.md        → Project documentation
```


##  Technologies Used

| Technology | Purpose |
|------------|---------|
| **HTML5** | Page structure and layout |
| **CSS3** | Styling, dark mode, responsive grid, animations |
| **JavaScript ES6** | API calls, DOM manipulation, logic |
| **OpenWeatherMap API** | Real-time weather data |
| **Google Fonts** | DM Sans & DM Serif Display typography |

---

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection
- Free OpenWeatherMap API key

### Step 1 — Clone the Repository
```bash
git clone https://github.com/your-username/weather-app.git
cd weather-app
```

### Step 2 — Get a Free API Key
1. Visit  [https://openweathermap.org/api](https://openweathermap.org/api)
2. Click **Sign Up** — no credit card required
3. Verify your email
4. Go to **My API Keys** in your dashboard
5. Copy your **Default** API key

### Step 3 — Configure API Key
Open `script.js` and replace line 3:
```js
const API_KEY = 'your_api_key_here';
```

>  **Note:** After signing up, wait **10–15 minutes** for the key to activate.

### Step 4 — Run the App
- Open `index.html` directly in your browser, **or**
- Use VS Code **Live Server** extension for best experience

---


##  How It Works

User Input (City / GPS)
        ↓
JavaScript fetches OpenWeatherMap API
        ↓
JSON response is parsed
        ↓
Current weather + 5-day forecast rendered to DOM
        ↓
Unit toggle (°C/°F) re-renders without new API call
```

##  Browser Support

- Chrome 
- Firefox 
- Edge 
- Safari 
- Opera 

---

## Author

**Shreyas S**
---


## Internship

Prodigy InfoTech Web Development Internship
