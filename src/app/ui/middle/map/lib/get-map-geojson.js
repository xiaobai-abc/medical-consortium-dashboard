/**
 * 通过静态资源请求读取杭州市 GeoJSON。
 * 这里不依赖 Node 文件系统，保证 static export 后仍然可用。
 */
export async function getHangzhouGeoJson() {
  const response = await fetch("/json/330100.geojson");

  return response.json();
}
