const DEFAULT_LOCATIONS = [
  { name: '東京', lat: 35.6785, lng: 139.6823 }
];

let currentIndex = 0;

function loadLocations() {
  const saved = localStorage.getItem('weather_locations');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return DEFAULT_LOCATIONS.slice();
}

function saveLocations(locations) {
  localStorage.setItem('weather_locations', JSON.stringify(locations));
}

function handleAdd() {
  const nameEl = document.querySelector('#add-form input[name="name"]');
  const latEl = document.querySelector('#add-form input[name="lat"]');
  const lngEl = document.querySelector('#add-form input[name="lng"]');

  const name = nameEl.value.trim();
  const lat = parseFloat(latEl.value);
  const lng = parseFloat(lngEl.value);

  if (!name || isNaN(lat) || isNaN(lng)) {
    alert('地名・緯度・経度をすべて入力してください。');
    return;
  }

  const locations = loadLocations();
  locations.push({ name, lat, lng });
  saveLocations(locations);

  nameEl.value = '';
  latEl.value = '';
  lngEl.value = '';

  renderLocationList();
}

function removeLocation(index) {
  const locations = loadLocations();
  if (locations.length <= 1) {
    alert('最後の1件は削除できません。');
    return;
  }

  locations.splice(index, 1);
  saveLocations(locations);

  if (currentIndex >= locations.length) {
    currentIndex = locations.length - 1;
  }

  renderLocationList();
  switchLocation(currentIndex);
}

function renderLocationList() {
  const locations = loadLocations();
  const list = document.getElementById('location-list');
  list.innerHTML = '';

  locations.forEach(function (loc, i) {
    const li = document.createElement('li');

    const switchBtn = document.createElement('button');
    switchBtn.className = 'loc-btn' + (i === currentIndex ? ' active' : '');
    switchBtn.textContent = loc.name;
    switchBtn.onclick = function () { switchLocation(i); };

    const delBtn = document.createElement('button');
    delBtn.className = 'del-btn';
    delBtn.textContent = '✕';
    delBtn.onclick = function () { removeLocation(i); };

    li.appendChild(switchBtn);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

function switchLocation(index) {
  currentIndex = index;
  renderLocationList();

  const locations = loadLocations();
  const loc = locations[index];
  document.getElementById('city-name').textContent = loc.name + 'の天気';

  const url = 'https://api.open-meteo.com/v1/forecast'
    + '?latitude=' + loc.lat
    + '&longitude=' + loc.lng
    + '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum'
    + '&timezone=Asia%2FTokyo';

  fetch(url)
    .then(function (response) { return response.json(); })
    .then(function (data) { makePage(data); });
}

function makePage(data) {
  // 既存の処理（今日・明日）
  setData('day0', dateFormatWithWeekday(data.daily.time[0], 0));
setData('day1', dateFormatWithWeekday(data.daily.time[1], 1));
setData('day2', dateFormatWithWeekday(data.daily.time[2], 2)); // ★ 追加：明後日の日付

  setData('weathercode0', getWMO(data.daily.weathercode[0]));
  setData('weathercode1', getWMO(data.daily.weathercode[1]));
  setData('weathercode2', getWMO(data.daily.weathercode[2]));  // ★ 追加

  setData('temperature_2m_max0', data.daily.temperature_2m_max[0] + '℃');
  setData('temperature_2m_max1', data.daily.temperature_2m_max[1] + '℃');
  setData('temperature_2m_max2', data.daily.temperature_2m_max[2] + '℃');  // ★ 追加

  setData('temperature_2m_min0', data.daily.temperature_2m_min[0] + '℃');
  setData('temperature_2m_min1', data.daily.temperature_2m_min[1] + '℃');
  setData('temperature_2m_min2', data.daily.temperature_2m_min[2] + '℃');  // ★ 追加

  setData('precipitation_sum0', data.daily.precipitation_sum[0] + 'mm');
  setData('precipitation_sum1', data.daily.precipitation_sum[1] + 'mm');
  setData('precipitation_sum2', data.daily.precipitation_sum[2] + 'mm');  // ★ 追加

  // 降水量に応じて背景色を変える（既存）
  const rainy = data.daily.precipitation_sum[0] > 0;
  document.getElementById('body').style.backgroundColor = rainy ? '#cff' : '#ffc';
}

function setData(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = value;
}

function dateFormat(date, mode) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = addZero(d.getHours());
  const minute = addZero(d.getMinutes());
  const second = addZero(d.getSeconds());

  if (mode === 1) return year + '年' + month + '月' + day + '日 ' + hour + ':' + minute + ':' + second;
  return month + '月' + day + '日';
}

function getWeekday(d) {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[d.getDay()];
}

function getRelativeLabel(index) {
  if (index === 0) return '今日';
  if (index === 1) return '明日';
  if (index === 2) return '明後日';
  return '';
}

function dateFormatWithWeekday(dateStr, index) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = getWeekday(d);
  const label = getRelativeLabel(index);
  return month + '月' + day + '日（' + label + '・' + weekday + '）';
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

renderLocationList();
switchLocation(currentIndex);

setInterval(function () {
  setData('time', dateFormat(new Date(), 1));
}, 1000);

setInterval(function () {
  switchLocation(currentIndex);
}, 1000 * 60 * 60);