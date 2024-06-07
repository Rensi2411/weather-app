// Select DOM elements
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

// OpenWeatherMap API key
const API_KEY = "97043ad8e69c222ce4864af5799b52d6";

// Function to create weather card HTML
const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
      // HTML for the current weather card
      return `<div class="details">
                      <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                      <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(
                        2
                      )}°C</h6>
                      <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                      <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                  </div>
                  <div class="icon">
                      <img src="https://openweathermap.org/img/wn/${
                        weatherItem.weather[0].icon
                      }@4x.png" alt="weather-icon" class="${getWeatherAnimation(weatherItem.weather[0].main)}">
                      <h6>${weatherItem.weather[0].description}</h6>
                  </div>`;
    } else {
      // HTML for the other five day forecast cards
      return `<li class="card">
                      <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                      <div class="icon">
                      <img src="https://openweathermap.org/img/wn/${
                        weatherItem.weather[0].icon
                      }@4x.png" alt="weather-icon" class="${getWeatherAnimation(weatherItem.weather[0].main)}">
                      <h6>${weatherItem.weather[0].description}</h6>
                      </div>
                      <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(
                        2
                      )}°C</h6>
                      <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                      <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                  </li>`;
    }
  };
  
  
// Function to fetch weather details for a given city
const getWeatherDetails = (cityName, latitude, longitude) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((response) => response.json())
    .then((data) => {
      // Filter the forecasts to get only one forecast per day
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      // Clearing previous weather data
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      // Creating weather cards and adding them to the DOM
      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", html);
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the weather forecast!");
    });
};

// Function to fetch coordinates for a given city name
const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (cityName === "") return;
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      const { lat, lon, name } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates!");
    });
};

// Function to fetch user's coordinates using Geolocation API
const getUserCoordinates = () => {
    const lastLocation = localStorage.getItem("lastLocation");
    
    if (lastLocation) {
      const { name, latitude, longitude } = JSON.parse(lastLocation);
      getWeatherDetails(name, latitude, longitude);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
          fetch(API_URL)
            .then((response) => response.json())
            .then((data) => {
              const { name } = data[0];
              localStorage.setItem("lastLocation", JSON.stringify({ name, latitude, longitude }));
              getWeatherDetails(name, latitude, longitude);
            })
            .catch(() => {
              alert("An error occurred while fetching the city name!");
            });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert(
              "Geolocation request denied. Please reset location permission to grant access again."
            );
          } else {
            alert("Geolocation request error. Please reset location permission.");
          }
        }
      );
    }
  };

// Event listeners for search button, location button, and enter key press in the input field
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCityCoordinates()
);

const modeToggle = document.getElementById("mode-toggle");
const body = document.body;

// Function to enable dark mode
const enableDarkMode = () => {
  body.classList.add("dark-mode");
  modeToggle.checked = true;
  localStorage.setItem("theme", "dark");
};

// Function to disable dark mode
const disableDarkMode = () => {
  body.classList.remove("dark-mode");
  modeToggle.checked = false;
  localStorage.setItem("theme", "light");
};

// Event listener for dark mode toggle
modeToggle.addEventListener("change", () => {
  if (modeToggle.checked) {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
});

// Check user's preference from localStorage
if (localStorage.getItem("theme") === "dark") {
  enableDarkMode();
} else {
  disableDarkMode();
}

// Function to get the appropriate CSS class based on weather condition
const getWeatherAnimation = (weatherMain) => {
    switch (weatherMain.toLowerCase()) {
      case "rain":
        return "rain";
      case "clouds":
        return "clouds";
      case "clear":
        return "clear";
      default:
        return "";
    }
  };

