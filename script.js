// ── CONFIG ────────────────────────────────────────────────────────────────────
// Get a free API key at https://openweathermap.org/api
const API_KEY = '4f0df3c54fdb84a1db45d939cfcef22e';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';
// ─────────────────────────────────────────────────────────────────────────────

let unit = 'C';       // Current temperature unit
let lastData = null;  // Cache last API response for unit toggling

// ── Unit Helpers ──────────────────────────────────────────────────────────────

/**
 * Switch between Celsius and Fahrenheit.
 * Re-renders weather if data is already loaded.
 */
function setUnit(u) {
  unit = u;
  document.getElementById('btn-c').className = 'unit-btn' + (u === 'C' ? ' active' : '');
  document.getElementById('btn-f').className = 'unit-btn' + (u === 'F' ? ' active' : '');
  if (lastData) renderWeather(lastData);
}

/** Convert Celsius to Fahrenheit */
function toF(c) {
  return Math.round(c * 9 / 5 + 32);
}

/** Return formatted temperature string in current unit */
function showTemp(c) {
  return (unit === 'C' ? Math.round(c) : toF(c)) + '°' + unit;
}

// ── Enter Key Listener ────────────────────────────────────────────────────────
document.getElementById('wa-input').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') searchWeather();
});

// ── UI State Helpers ──────────────────────────────────────────────────────────

/** Show a temporary error message */
function showError(msg) {
  const el = document.getElementById('wa-error');
  el.textContent = '⚠ ' + msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

/** Show loading spinner */
function setLoading() {
  document.getElementById('wa-content').innerHTML =
    '<div class="idle-msg"><div class="idle-icon spin">🔄</div>Fetching weather data…</div>';
}

/** Reset to idle/empty state */
function setIdle() {
  document.getElementById('wa-content').innerHTML =
    '<div class="idle-msg"><div class="idle-icon">🌤️</div>Enter a city name or tap 📍 to use your current location.</div>';
}

// ── Icon Mapping ──────────────────────────────────────────────────────────────

/** Map OpenWeatherMap condition ID to an emoji icon */
function weatherIcon(id) {
  if (id >= 200 && id < 300) return '⛈️';
  if (id >= 300 && id < 400) return '🌦️';
  if (id >= 500 && id < 502) return '🌧️';
  if (id >= 502 && id < 600) return '⛈️';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫️';
  if (id === 800)             return '☀️';
  if (id === 801)             return '🌤️';
  if (id === 802)             return '⛅';
  if (id >= 803)              return '☁️';
  return '🌡️';
}

// ── Wind Direction ────────────────────────────────────────────────────────────

/** Convert wind degree to compass direction */
function windDir(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

// ── Day Name ──────────────────────────────────────────────────────────────────

/** Get short day name from Unix timestamp */
function dayName(dt) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(dt * 1000).getDay()];
}

// ── API Calls ─────────────────────────────────────────────────────────────────

/** Fetch weather by city name */
async function searchWeather() {
  const city = document.getElementById('wa-input').value.trim();
  if (!city) { showError('Please enter a city name.'); return; }
  setLoading();
  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) {
      const j = await res.json();
      showError(j.message || 'City not found. Try another name.');
      setIdle();
      return;
    }
    const data = await res.json();
    lastData = data;
    renderWeather(data);
  } catch (e) {
    showError('Network error — check your connection and try again.');
    setIdle();
  }
}

/** Fetch weather by GPS coordinates using browser Geolocation API */
function getLocation() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }
  setLoading();
  navigator.geolocation.getCurrentPosition(
    async function (pos) {
      const { latitude: lat, longitude: lon } = pos.coords;
      try {
        const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const res = await fetch(url);
        if (!res.ok) {
          showError('Could not load weather for your location.');
          setIdle();
          return;
        }
        const data = await res.json();
        lastData = data;
        renderWeather(data);
        document.getElementById('wa-input').value = data.city.name;
      } catch (e) {
        showError('Network error.');
        setIdle();
      }
    },
    function () {
      showError('Location access denied. Please search manually.');
      setIdle();
    }
  );
}

// ── Render ────────────────────────────────────────────────────────────────────

/** Build 5-day daily forecast from 3-hour interval data */
function buildForecast(list) {
  const dailyMap = {};
  list.forEach(function (item) {
    const key = new Date(item.dt * 1000).toDateString();
    if (!dailyMap[key]) {
      dailyMap[key] = {
        hi: item.main.temp_max,
        lo: item.main.temp_min,
        dt: item.dt,
        icon: weatherIcon(item.weather[0].id)
      };
    } else {
      if (item.main.temp_max > dailyMap[key].hi) dailyMap[key].hi = item.main.temp_max;
      if (item.main.temp_min < dailyMap[key].lo) dailyMap[key].lo = item.main.temp_min;
    }
  });
  return Object.values(dailyMap).slice(1, 6); // Skip today, show next 5 days
}

/** Render all weather data into the DOM */
function renderWeather(data) {
  const now    = data.list[0];
  const city   = data.city;

  // Current conditions
  const temp   = now.main.temp;
  const feels  = now.main.feels_like;
  const high   = now.main.temp_max;
  const low    = now.main.temp_min;
  const hum    = now.main.humidity;
  const wind   = now.wind.speed;
  const wdir   = now.wind.deg !== undefined ? windDir(now.wind.deg) : '';
  const press  = now.main.pressure;
  const vis    = now.visibility ? (now.visibility / 1000).toFixed(1) : '—';
  const clouds = now.clouds ? now.clouds.all : '—';
  const desc   = now.weather[0].description;
  const icon   = weatherIcon(now.weather[0].id);

  // Sun times
  const sr = new Date(city.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const ss = new Date(city.sunset  * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Date & time strings
  const date    = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const updated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Forecast cards HTML
  const forecastDays = buildForecast(data.list);
  const fcCards = forecastDays.map(function (d) {
    return `
      <div class="fc-card">
        <div class="fc-day">${dayName(d.dt)}</div>
        <div class="fc-icon">${d.icon}</div>
        <div class="fc-hi">${showTemp(d.hi)}</div>
        <div class="fc-lo">${showTemp(d.lo)}</div>
      </div>`;
  }).join('');

  // Inject HTML
  document.getElementById('wa-content').innerHTML = `
    <div class="hero-card fade-in">
      <div class="hero-accent"></div>
      <div class="city-name">${city.name}</div>
      <div class="city-meta">${city.country} &bull; ${date}</div>
      <div class="temp-row">
        <div class="weather-icon-big">${icon}</div>
        <div class="temp-big">${showTemp(temp)}</div>
        <div class="temp-meta">
          <div class="weather-desc">${desc}</div>
          <div class="feels-like">Feels like ${showTemp(feels)}</div>
          <div class="feels-like" style="margin-top:2px">H: ${showTemp(high)} &nbsp; L: ${showTemp(low)}</div>
        </div>
      </div>
    </div>

    <div class="stats-grid fade-in">
      <div class="stat-card">
        <div class="stat-label">Humidity</div>
        <div class="stat-value">${hum}<span class="stat-unit">%</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Wind</div>
        <div class="stat-value">${Math.round(wind)}<span class="stat-unit">m/s</span>
          ${wdir ? `<div class="wind-dir">${wdir}</div>` : ''}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Pressure</div>
        <div class="stat-value">${press}<span class="stat-unit">hPa</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Visibility</div>
        <div class="stat-value">${vis}<span class="stat-unit">km</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Cloud Cover</div>
        <div class="stat-value">${clouds}<span class="stat-unit">%</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sunrise</div>
        <div class="stat-value" style="font-size:16px">${sr}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sunset</div>
        <div class="stat-value" style="font-size:16px">${ss}</div>
      </div>
    </div>

    <div class="forecast-section fade-in">
      <div class="section-title">5-day forecast</div>
      <div class="forecast-row">${fcCards}</div>
    </div>

    <div class="updated-row fade-in">Last updated at ${updated}</div>
  `;
}
