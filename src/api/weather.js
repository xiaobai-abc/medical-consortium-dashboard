import { httpClient } from "./http-client";
// 心知天气
const WEATHER_API_URL =
  "https://api.seniverse.com/v3/weather/now.json?key=S6T2mTE8Ei1ti945N&location=hangzhou&language=zh-Hans&unit=c";

/**
 * 顶部天气接口。
 * 第三方完整地址可以继续走统一封装，但要跳过业务鉴权、mock 头和业务解包。
 */
export function getWeatherData(requestOptions = {}) {
  return httpClient.get(WEATHER_API_URL, {
    withAuth: false,
    withMock: false,
    unwrapResponse: false,
    ...requestOptions,
  });
}
