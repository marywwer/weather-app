export function createMapIframe(lat, lon) {
  const iframe = document.createElement("iframe");
  const delta = 0.2;
  const left = lon - delta;
  const right = lon + delta;
  const top = lat + delta;
  const bottom = lat - delta;

  const src = "https://www.openstreetmap.org/export/embed.html?" +
    `bbox=${left},${bottom},${right},${top}&layer=mapnik&marker=${lat},${lon}`;

  iframe.src = src;
  iframe.loading = "lazy";
  return iframe;
}