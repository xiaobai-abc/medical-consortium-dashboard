import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

/**
 * 读取首页标题栏需要的环境变量，缺失时回退到默认值。
 */
function getHomeHeaderEnv() {
  return {
    title: process.env.NEXT_PUBLIC_APP_NAME || "医共体慢病管理平台",
    weatherText: process.env.NEXT_PUBLIC_WEATHER_TEXT || "晴",
    temperatureText: process.env.NEXT_PUBLIC_WEATHER_TEMPERATURE || "24°C",
  };
}

/**
 * 组装首页 header 展示文案，供 page.js 直接消费。
 */
export function getHomeHeaderData() {
  const headerEnv = getHomeHeaderEnv();
  const currentDateLabel = dayjs().format("YYYY年M月D日 dddd");

  return {
    title: headerEnv.title,
    statusText: `系统运行正常 ${currentDateLabel} ${headerEnv.weatherText} ${headerEnv.temperatureText}`,
  };
}
