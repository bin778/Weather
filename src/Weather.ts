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
  "seoul": "../image/seoul.jpg",
  "tokyo": "../image/tokyo.jpg",
  "dubai": "../image/dubai.jpg",
  "jakarta": "../image/jakarta.jpg",
  "los angeles": "../image/los_angeles.jpg",
  "toronto": "../image/toronto.jpg",
  "rome": "../image/rome.jpg",
  "paris": "../image/paris.jpg",
  "moscow": "../image/moscow.jpg",
  "cape town": "../image/cape_town.jpg"
};

// 도시 이름을 한국어로 매핑
const cityTranslationMap: { [key: string]: string } = {
  "Seoul": "서울",
  "Tokyo": "도쿄",
  "Dubai": "두바이",
  "Jakarta": "자카르타",
  "Los Angeles": "로스앤젤레스",
  "Toronto": "토론토",
  "Rome": "로마",
  "Paris": "파리",
  "Moscow": "모스크바",
  "Cape Town": "케이프타운"
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
      // 현재 날씨 정보에서 위도와 경도를 추출하여 5일 예보 데이터를 가져옴
      const { lat, lon } = data.coord;
      getWeatherForecast(lat, lon);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function getWeatherForecast(lat: number, lon: number) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=kr`);
    if (!response.ok) {
      throw new Error(`Error fetching weather forecast data: ${response.statusText}`);
    }
    const data = await response.json();
    if (typeof document !== 'undefined') {
      displayWeatherForecast(data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function displayCurrentWeather(data: any) {
  const currentWeatherDiv = document.getElementById('current-weather');
  const body = document.getElementById('body');

  // 한국어 도시 이름과 영어 도시 이름을 비교
  const englishCityName = data.name;
  const koreanCityName = cityTranslationMap[englishCityName] || englishCityName;

  if (currentWeatherDiv && body) {
    // 배경 이미지 변경
    body.style.backgroundImage = `url('${cityBackgroundMap[data.name.toLowerCase()]}')`;

    currentWeatherDiv.innerHTML = `
      <h3 class="text-base md:text-xl font-bold mb-4 text-black">${new Date().toLocaleDateString('ko-KR', options)}</h3>
      <div class="flex items-center text-black">
        <div class="flex-1">
          <h4 class="text-xl md:text-2xl font-bold mb-2">${koreanCityName}</h4>
          <p class="text-base md:text-xl mb-2">${data.main.temp.toFixed(1)}°C</p>
          <p class="text-xs md:text-base">강수확률: ${data.clouds.all}%</p>
          <p class="text-xs md:text-base">습도: ${data.main.humidity}%</p>
          <p class="text-xs md:text-base">풍속: ${data.wind.speed}m/s</p>
          <p class="text-xs md:text-base">날씨 상태: ${data.weather[0].description}</p>
        </div>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Weather Icon" width="50px" class="ml-4"/>
      </div>
    `;
  }
}

function filterDailyForecasts(forecastList: any[]) {
  // 매일 정오(12:00)의 데이터를 추출
  return forecastList.filter((forecast: any) => {
    const date = new Date(forecast.dt * 1000);
    return date.getHours() === 12;
  });
}

function displayWeatherForecast(data: any) {
  const forecastDiv = document.getElementById('weather-forecast');
  const body = document.getElementById('body');

  // 1일 간격으로 필터링된 데이터
  const dailyForecasts = filterDailyForecasts(data.list);

  if (forecastDiv && body) {
    forecastDiv.innerHTML = `
      <h3 class="text-base md:text-xl font-bold mb-4 text-black">5일간 날씨 예보</h3>
      <div class="forecast-grid flex flex-row space-x-4">
        ${dailyForecasts.map((forecast: any) => `
          <div class="forecast-item text-black text-xs md:text-base">
            <p class="font-bold">${new Date(forecast.dt * 1000).toLocaleDateString('ko-KR', options)}</p>
            <p>${forecast.main.temp.toFixed(1)}°C</p>
            <p>${forecast.weather[0].description}</p>
            <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather Icon" width="40px"/>
          </div>
        `).join('')}
      </div>
    `;
  }
}

if (typeof document !== 'undefined') {
  document.getElementById('getWeatherBtn')?.addEventListener('click', () => {
    const citySelect = document.getElementById('city-select') as HTMLSelectElement;
    const location = citySelect.value;
    getWeather(location);
  });

  const defaultLocation = 'seoul';
  getWeather(defaultLocation);
}