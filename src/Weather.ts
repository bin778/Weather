import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENWEATHERMAP_API_KEY;
if (!apiKey) {
  throw new Error('API key is not defined. Please set it in the .env file.');
}

const options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  numberingSystem: 'latn',
  localeMatcher: 'best fit'
};

async function getWeather(location: string) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`);
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
  if (currentWeatherDiv) {
    currentWeatherDiv.innerHTML = `
      <h3 class="text-xl font-bold mb-4 text-black">${new Date().toLocaleDateString('ko-KR', options)}</h3>
      <div class="flex items-center text-black">
        <div class="flex-1">
          <h4 class="text-2xl font-bold mb-2">${data.name}</h4>
          <p class="text-xl mb-2">${data.main.temp}°C</p>
          <p>강수확률: ${data.clouds.all}%</p>
          <p>습도: ${data.main.humidity}%</p>
          <p>풍속: ${data.wind.speed}m/s</p>
        </div>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Weather Icon" width="50px" class="ml-4"/>
      </div>
    `;
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

  const defaultLocation = 'Seoul';
  getWeather(defaultLocation);
  getWeeklyWeather(defaultLocation);
}