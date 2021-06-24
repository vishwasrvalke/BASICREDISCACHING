import axios from "axios";
import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();
const redis = new Redis({
  port: 6379,
  host: "127.0.0.1",
});

const cityEndPoint = (city) =>
  `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${process.env.WEATHER_API_KEY}`;

const getWeather = async (city) => {
  let cacheEntry = await redis.get(`weather:${city}`);

  if (cacheEntry) {
    cacheEntry = JSON.parse(cacheEntry);

    return { ...cacheEntry, source: "CACHE" };
  }

  let apiResponse = await axios.get(cityEndPoint(city));

  redis.set(`weather:${city}`, JSON.stringify(apiResponse?.data), "EX", 3600);

  return { ...apiResponse?.data, source: "API" };
};

const city = "Bangalore";

const startTime = new Date().getTime();

let weather = await getWeather(city);

const endTime = new Date().getTime();

weather.responseTime = `${endTime - startTime}ms`;

console.log(weather);

process.exit();
