export function validateCityInput(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Введите название города";
  }
  if (trimmed.length < 2) {
    return "Слишком короткое название";
  }
  if (!/^[\p{L}\s-]+$/u.test(trimmed)) {
    return "Допустимы только буквы, пробелы и дефис";
  }
  return "";
}

export function validateCoordinates(latStr, lonStr) {
  if (!latStr.trim() || !lonStr.trim()) {
    return "Введите обе координаты";
  }
  const lat = Number(latStr.replace(",", "."));
  const lon = Number(lonStr.replace(",", "."));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return "Координаты должны быть числами";
  }
  if (lat < -90 || lat > 90) {
    return "Широта должна быть в диапазоне -90…90";
  }
  if (lon < -180 || lon > 180) {
    return "Долгота должна быть в диапазоне -180…180";
  }
  return "";
}