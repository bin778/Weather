import * as dotenv from '../node_modules/dotenv';
dotenv.config();

const apiKey = process.env.OPENWEATHERMAP_API_KEY;
if (!apiKey) {
  throw new Error('API key is not defined. Please set it in the .env file.');
}

const options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  numberingSystem: 'latn',
  localeMatcher: 'best fit'
};

// 도시별 배경 이미지 매핑
const cityBackgroundMap: { [key: string]: string } = {
  "seoul": "../image/city/seoul.jpg",
  "tokyo": "../image/city/tokyo.jpg",
  "new york": "../image/city/newyork.jpg",
  "paris": "../image/city/paris.jpg",
  "moscow": "../image/city/moscow.jpg",
  "sydney": "../image/city/sydney.jpg"
};

// 도시 이름을 한국어로 매핑
const cityTranslationMap: { [key: string]: string } = {
  "Seoul": "서울",
  "Tokyo": "도쿄",
  "New York": "뉴욕",
  "Paris": "파리",
  "Moscow": "모스크바",
  "Sydney": "시드니"
};

async function getWeather(location: string) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}&lang=kr`);
    if (!response.ok) {
      throw new Error(`Error fetching weather data: ${response.statusText}`);
    }
    const data = await response.json();
    if (typeof document !== 'undefined') {
      displayCurrentWeather(data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function getWeeklyWeather(location: string) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast/daily?q=${location}&cnt=7&units=metric&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Error fetching weekly weather data: ${response.statusText}`);
    }
    const data = await response.json();
    if (typeof document !== 'undefined') {
      displayWeeklyWeather(data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function displayCurrentWeather(data: any) {
  const currentWeatherDiv = document.getElementById('current-weather');
  const body = document.getElementById('body');
  const weatherIcon = document.getElementById('weather-icon') as HTMLImageElement;

  // 한국어 도시 이름과 영어 도시 이름을 비교
  const englishCityName = data.name;
  const koreanCityName = cityTranslationMap[englishCityName] || englishCityName;

  if (currentWeatherDiv && body) {
    // 배경 이미지 변경
    body.style.backgroundImage = `url('${cityBackgroundMap[data.name.toLowerCase()]}')`;

    currentWeatherDiv.innerHTML = `
      <h3 class="text-xl font-bold mb-4 text-black">${new Date().toLocaleDateString('ko-KR', options)}</h3>
      <div class="flex items-center text-black">
        <div class="flex-1">
          <h4 class="text-2xl font-bold mb-2">${koreanCityName}</h4>
          <p class="text-xl mb-2">${data.main.temp.toFixed(1)}°C</p>
          <p>강수확률: ${data.clouds.all}%</p>
          <p>습도: ${data.main.humidity}%</p>
          <p>풍속: ${data.wind.speed}m/s</p>
          <p>날씨 상태: ${data.weather[0].description}</p>
        </div>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Weather Icon" width="50px" class="ml-4"/>
      </div>
    `;
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
  }
}

function displayWeeklyWeather(data: any) {
  const forecastDiv = document.getElementById('forecast');
  if (forecastDiv) {
    forecastDiv.innerHTML = data.list.map((day: any) => `
      <div class="bg-white bg-opacity-50 p-4 rounded-lg shadow-md">
        <h4 class="text-lg font-bold">${new Date(day.dt * 1000).toLocaleDateString('ko-KR', options)}</h4>
        <p>온도: ${day.temp.day}°C</p>
        <p>강수확률: ${day.clouds}%</p>
        <p>습도: ${day.humidity}%</p>
        <p>풍속: ${day.speed}m/s</p>
      </div>
    `).join('');
  }
}

// 클라이언트에서만 실행
if (typeof document !== 'undefined') {
  document.getElementById('getWeatherBtn')?.addEventListener('click', () => {
    const citySelect = document.getElementById('city-select') as HTMLSelectElement;
    const location = citySelect.value;
    getWeather(location);
    getWeeklyWeather(location);
  });

  const defaultLocation = 'seoul';
  getWeather(defaultLocation);
  // getWeeklyWeather(defaultLocation);
}