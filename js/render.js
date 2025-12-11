import { validateCityInput, validateCoordinates } from './validation.js';
import { getCoordinatesByCity, getWeather, formatLocalTime, getWeatherIcon, getWeatherDescription } from './weather.js';
import { createMapIframe } from './map.js';

function setAppDate() {
  const el = document.getElementById("app-date");
  const now = new Date();
  el.textContent = now.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function createWeatherCard(weather, meta, withMap) {
  const template = document.getElementById("weather-card-template");
  const node = template.content.cloneNode(true);
  const card = node.querySelector(".card");

  card.querySelector(".card__city").textContent = meta.cityLabel;
  card.querySelector(".card__location").textContent = meta.locationLabel;

  const iconEl = card.querySelector(".card__icon");
  iconEl.textContent = getWeatherIcon(weather.weatherCode, weather.isDay);

  card.querySelector(".card__temp-value").textContent =
    Math.round(weather.temperature);
  card.querySelector(".card__condition").textContent =
    getWeatherDescription(weather.weatherCode);

  const feels = weather.feelsLike != null
    ? `${Math.round(weather.feelsLike)} °C`
    : "—";
  const humidity = weather.humidity != null
    ? `${Math.round(weather.humidity)} %`
    : "—";

  card.querySelector(".card__feels-like").textContent = feels;
  card.querySelector(".card__humidity").textContent = humidity;

  const windText = `${Math.round(weather.windSpeed)} м/с`;
  card.querySelector(".card__wind").textContent = windText;

  const localTime = formatLocalTime(weather.timezone, weather.timeIso);
  card.querySelector(".card__local-time").textContent = localTime;

  card.querySelector(".card__coords").textContent =
    `Координаты: ${weather.lat.toFixed(3)}, ${weather.lon.toFixed(3)}`;

  if (withMap) {
    const mapWrap = card.querySelector(".card__map-wrap");
    mapWrap.appendChild(createMapIframe(weather.lat, weather.lon));
  }

  const closeBtn = card.querySelector(".card__close");
  closeBtn.addEventListener("click", () => {
    card.remove();
  });

  return card;
}

function addCardToContainer(card) {
  const container = document.getElementById("widgets-container");
  container.prepend(card);
}

async function handleCityFormSubmit(event) {
  event.preventDefault();

  const input = document.getElementById("city-input");
  const errorEl = document.getElementById("city-error");
  const btn = event.submitter || event.target.querySelector("button");

  errorEl.textContent = "";
  const error = validateCityInput(input.value);

  if (error) {
    errorEl.textContent = error;
    return;
  }

  btn.disabled = true;
  btn.textContent = "Загружаю...";

  try {
    const place = await getCoordinatesByCity(input.value);
    const weather = await getWeather(place.lat, place.lon, place.timezone);

    const card = createWeatherCard(weather, {
      cityLabel: place.city,
      locationLabel: place.country || "Город"
    }, false);

    addCardToContainer(card);
    input.value = "";
  } catch (err) {
    errorEl.textContent = err.message || "Ошибка при загрузке погоды";
  } finally {
    btn.disabled = false;
    btn.textContent = "Добавить виджет";
  }
}

async function handleCoordsFormSubmit(event) {
  event.preventDefault();

  const latInput = document.getElementById("lat-input");
  const lonInput = document.getElementById("lon-input");
  const errorEl = document.getElementById("coords-error");
  const btn = event.submitter || event.target.querySelector("button");

  errorEl.textContent = "";
  const validationError = validateCoordinates(latInput.value, lonInput.value);

  if (validationError) {
    errorEl.textContent = validationError;
    return;
  }

  const lat = Number(latInput.value.replace(",", "."));
  const lon = Number(lonInput.value.replace(",", "."));

  btn.disabled = true;
  btn.textContent = "Загружаю...";

  try {
    const weather = await getWeather(lat, lon, "UTC");
    const card = createWeatherCard(weather, {
      cityLabel: "Координаты",
      locationLabel: `lat ${lat.toFixed(2)}, lon ${lon.toFixed(2)}`
    }, true);

    addCardToContainer(card);
  } catch (err) {
    errorEl.textContent = err.message || "Ошибка при загрузке погоды";
  } finally {
    btn.disabled = false;
    btn.textContent = "Добавить виджет + карта";
  }
}

export function initApp() {
  setAppDate();
  setInterval(setAppDate, 60_000);

  const cityForm = document.getElementById("city-form");
  const coordsForm = document.getElementById("coords-form");

  cityForm.addEventListener("submit", handleCityFormSubmit);
  coordsForm.addEventListener("submit", handleCoordsFormSubmit);
}