export const GEO_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
export const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Ошибка сети: " + response.status);
  }
  return response.json();
}