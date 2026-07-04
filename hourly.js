function loadLocations() {
  const saved = localStorage.getItem('weather_locations');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [{ name: '東京', lat: 35.6785, lng: 139.6823 }];
}

function loadCurrentIndex() {
  const saved = localStorage.getItem('weather_current_index');
  return saved !== null ? parseInt(saved, 10) : 0;
}

function addZero(n) {
  return n < 10 ? '0' + n : String(n);
}

function getWMO(w) {
  if (w === 0) return '☀️';
  if (w === 1) return '🌤';
  if (w === 2) return '⛅️';
  if (w === 3) return '☁️';
  if (w === 45 || w === 48) return '霧';
  if (w >= 51 && w <= 57) return '霧雨';
  if (w >= 61 && w <= 67) return '☔️';
  if (w >= 71 && w <= 77) return '❄️';
  if (w >= 80 && w <= 82) return '☔️';
  if (w >= 85 && w <= 86) return '❄️';
  if (w >= 95) return '⚡️☔️';
  return String(w);
}

function loadHourlyWeather() {
  let loc = null;
  const activeSaved = localStorage.getItem('weather_active_location');
  if (activeSaved) {
    try { loc = JSON.parse(activeSaved); } catch (e) {}
  }
  if (!loc) {
    const locations = loadLocations();
    const index = loadCurrentIndex();
    loc = locations[index] || locations[0];
  }

  document.getElementById('city-name').textContent = loc.name + 'の24時間天気';

  const url = 'https://api.open-meteo.com/v1/forecast'
    + '?latitude=' + loc.lat
    + '&longitude=' + loc.lng
    + '&hourly=temperature_2m,precipitation,weathercode'
    + '&timezone=Asia%2FTokyo'
    + '&forecast_days=1';

  fetch(url)
    .then(function (response) { return response.json(); })
    .then(function (data) { renderHourlyTable(data); })
    .catch(function (error) {
      console.error('24時間天気データの取得に失敗しました:', error);
    });
}

function renderHourlyTable(data) {
  const hourRow = document.getElementById('hour-row');
  const weatherRow = document.getElementById('weather-row');
  const tempRow = document.getElementById('temp-row');
  const precipRow = document.getElementById('precip-row');

  if (!hourRow || !weatherRow || !tempRow || !precipRow) return;

  const times = data.hourly.time;
  const temps = data.hourly.temperature_2m;
  const precs = data.hourly.precipitation;
  const codes = data.hourly.weathercode;

  for (let i = 0; i < 24; i++) {
    const d = new Date(times[i]);
    const hour = addZero(d.getHours());

    const th = document.createElement('th');
    th.textContent = hour + '時';
    hourRow.appendChild(th);

    const weatherTd = document.createElement('td');
    weatherTd.textContent = getWMO(codes[i]);
    weatherRow.appendChild(weatherTd);

    const tempTd = document.createElement('td');
    tempTd.textContent = temps[i] + '℃';
    tempRow.appendChild(tempTd);

    const precipTd = document.createElement('td');
    precipTd.textContent = precs[i] + 'mm';
    precipRow.appendChild(precipTd);
  }
}

loadHourlyWeather();