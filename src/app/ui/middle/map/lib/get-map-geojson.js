import { readFileSync } from "fs";
import path from "path";

/**
 * 从本地 src/json 读取杭州市 GeoJSON，确保地图完全离线可用。
 */
export function getHangzhouGeoJson() {
  const geoJsonPath = path.join(process.cwd(), "src/json/330100.geojson");
  const geoJsonText = readFileSync(geoJsonPath, "utf-8");

  return JSON.parse(geoJsonText);
}
