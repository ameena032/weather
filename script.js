const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezoneEl = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Insert your OpenWeather API key here
const API_KEY = 'YOUR_API_KEY_HERE';

// Function to update time and date every second
setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
    const minutes = time.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';

    timeEl.innerHTML = `${hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat}:${minutes < 10 ? '0' + minutes : minutes} <span id="am-pm">${ampm}</span>`;
    dateEl.innerHTML = `${days[day]}, ${date} ${months[month]}`;
}, 1000);

// Function to fetch and display weather data
function getWeatherData() {
    navigator.geolocation.getCurrentPosition((success) => {
        const { latitude, longitude } = success.coords;

        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`)
            .then((response) => response.json())
            .then((data) => {
                showWeatherData(data);
            })
            .catch((error) => {
                console.error('Error fetching weather data:', error);
            });
    });
}

// Function to display weather data
function showWeatherData(data) {
    if (!data || !data.current || !data.daily) {
        console.error("Weather data is incomplete or invalid");
        return;
    }

    // Extract data for current weather and forecast
    const { humidity, pressure, sunrise, sunset, wind_speed } = data.current;
    const { timezone, lat, lon, daily } = data;

    // Update timezone and location
    timezoneEl.innerHTML = timezone;
    countryEl.innerHTML = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;

    // Populate current weather details
    currentWeatherItemsEl.innerHTML = `
        <div class="weather-item">
            <div>Humidity</div>
            <div>${humidity}%</div>
        </div>
        <div class="weather-item">
            <div>Pressure</div>
            <div>${pressure} hPa</div>
        </div>
        <div class="weather-item">
            <div>Wind Speed</div>
            <div>${wind_speed} m/s</div>
        </div>
        <div class="weather-item">
            <div>Sunrise</div>
            <div>${moment(sunrise * 1000).format('HH:mm A')}</div>
        </div>
        <div class="weather-item">
            <div>Sunset</div>
            <div>${moment(sunset * 1000).format('HH:mm A')}</div>
        </div>
    `;

    // Populate current temperature for today
    currentTempEl.innerHTML = `
        <img src="http://openweathermap.org/img/wn/${daily[0].weather[0].icon}@4x.png" alt="weather icon" class="w-icon">
        <div class="other">
            <div class="day">${moment(daily[0].dt * 1000).format('dddd')}</div>
            <div class="temp">Night - ${daily[0].temp.night}&#176;C</div>
            <div class="temp">Day - ${daily[0].temp.day}&#176;C</div>
        </div>
    `;

    // Populate weather forecast for the next few days
    let otherDayForecast = '';
    daily.slice(1, 6).forEach((day) => {
        otherDayForecast += `
            <div class="weather-forecast-item">
                <div class="day">${moment(day.dt * 1000).format('ddd')}</div>
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                <div class="temp">Night - ${day.temp.night}&#176;C</div>
                <div class="temp">Day - ${day.temp.day}&#176;C</div>
            </div>
        `;
    });

    weatherForecastEl.innerHTML = otherDayForecast;
}

// Initialize weather data on page load
getWeatherData();
