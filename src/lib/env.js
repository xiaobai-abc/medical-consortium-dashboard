/**
 * 读取字符串环境变量，未配置时回退到默认值。
 */
function readEnvValue(name, fallbackValue) {
  const currentValue = process.env[name];

  if (typeof currentValue !== "string") {
    return fallbackValue;
  }

  return currentValue.trim() || fallbackValue;
}

/**
 * 读取数字环境变量，非法值时回退到默认值。
 */
function readEnvNumber(name, fallbackValue) {
  const parsedValue = Number(readEnvValue(name, String(fallbackValue)));

  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
}

/**
 * 读取前端大屏初始化阶段需要的公开环境变量。
 */
export function getPublicRuntimeConfig() {
  return {
    appName: readEnvValue("NEXT_PUBLIC_APP_NAME", "医共体管理平台"),
    appShortName: readEnvValue("NEXT_PUBLIC_APP_SHORT_NAME", "医共体运行大屏"),
    appEnv: readEnvValue(
      "NEXT_PUBLIC_APP_ENV",
      readEnvValue("APP_ENV", "development")
    ),
    apiBaseUrl: readEnvValue(
      "NEXT_PUBLIC_API_BASE_URL",
      "http://127.0.0.1:8080"
    ),
    amapKey: readEnvValue("NEXT_PUBLIC_AMAP_KEY", ""),
    screenBaseWidth: readEnvNumber("NEXT_PUBLIC_SCREEN_BASE_WIDTH", 1920),
    screenBaseHeight: readEnvNumber("NEXT_PUBLIC_SCREEN_BASE_HEIGHT", 1080),
    useMock: readEnvValue("NEXT_PUBLIC_USE_MOCK", "0") === "1",
  };
}

/**
 * 读取服务端接口地址，供后续 Route Handler 或服务端请求复用。
 */
export function getServerRuntimeConfig() {
  return {
    apiBaseUrl: readEnvValue(
      "SERVER_API_BASE_URL",
      readEnvValue("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:8080")
    ),
  };
}
