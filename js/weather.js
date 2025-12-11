import { GEO_API_URL, WEATHER_API_URL, fetchJson } from './api.js';

export async function getCoordinatesByCity(cityName) {
  const url = `${GEO_API_URL}?name=${encodeURIComponent(cityName)}&count=1&language=ru&format=json`;
  const data = await fetchJson(url);

  if (!data.results || data.results.length === 0) {
    throw new Error("Город не найден");
  }

  const place = data.results[0];
  return {
    lat: place.latitude,
    lon: place.longitude,
    city: place.name,
    country: place.country || "",
    timezone: place.timezone
  };
}

export async function getWeather(lat, lon, timezoneHint) {
  const url = `${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}` +
    "&current_weather=true&hourly=temperature_2m,relativehumidity_2m,apparent_temperature" +
    "&timezone=auto";

  const data = await fetchJson(url);

  if (!data.current_weather) {
    throw new Error("Нет данных о погоде");
  }

  const hourly = data.hourly || {};
  const index = (hourly.time || []).indexOf(data.current_weather.time);

  return {
    temperature: data.current_weather.temperature,
    windSpeed: data.current_weather.windspeed,
    windDirection: data.current_weather.winddirection,
    weatherCode: data.current_weather.weathercode,
    isDay: Boolean(data.current_weather.is_day),
    feelsLike: index >= 0 && hourly.apparent_temperature
      ? hourly.apparent_temperature[index]
      : null,
    humidity: index >= 0 && hourly.relativehumidity_2m
      ? hourly.relativehumidity_2m[index]
      : null,
    timezone: data.timezone || timezoneHint || "UTC",
    timeIso: data.current_weather.time,
    lat,
    lon
  };
}

export function getWeatherDescription(code) {
  if ([0].includes(code)) return "Ясно";
  if ([1, 2].includes(code)) return "Переменная облачность";
  if ([3].includes(code)) return "Пасмурно";
  if ([45, 48].includes(code)) return "Туман";
  if ([51, 53, 55].includes(code)) return "Морось";
  if ([61, 63, 65].includes(code)) return "Дождь";
  if ([80, 81, 82].includes(code)) return "Ливень";
  if ([71, 73, 75, 77].includes(code)) return "Снег";
  if ([95, 96, 99].includes(code)) return "Гроза";
  return "Погода";
}

export function getWeatherIcon(code, isDay) {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if ([1, 2].includes(code)) return isDay ? "🌤️" : "☁️";
  if ([3].includes(code)) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

export function formatLocalTime(timezone, isoTime) {
  const date = isoTime ? new Date(isoTime) : new Date();
  return date.toLocaleString("ru-RU", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit"
  });
}