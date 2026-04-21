const REGION_BAR_VALUE_MAP = {
  上城区: 48,
  拱墅区: 42,
  西湖区: 39,
  滨江区: 31,
  钱塘区: 27,
  临平区: 35,
  萧山区: 44,
  余杭区: 56,
  富阳区: 24,
  临安区: 29,
  桐庐县: 18,
  淳安县: 14,
  建德市: 22
};

/**
 * 把区县面数据转换成“柱状条点数据”。
 * 这里不直接复用原 GeoJSON，是因为柱状条图层只需要中心点和几项渲染字段，
 * 单独抽离后更方便独立调试、替换真实业务值以及排查“图层不显示”的问题。
 */
export function createMapBarGeoJson(featureList, calculateFeatureAnchor) {
  return {
    type: "FeatureCollection",
    features: featureList.map(function mapFeatureToBarPoint(feature, featureIndex) {
      return createBarPointFeature(
        feature,
        featureIndex,
        calculateFeatureAnchor(feature.geometry)
      );
    })
  };
}

/**
 * 为单个区县生成柱状条点数据。
 * `barTopSize` 不是“露出高度”，而是整根柱子的总高度。
 * 这样即使底下有已经挤出的 3D 板块，柱子也会有一截露在板块上方，
 * 避免再次出现“柱子被板块完全埋住，看起来像没生效”的情况。
 */
function createBarPointFeature(feature, featureIndex, anchor) {
  const featureName = feature.properties.name;
  const barValue = REGION_BAR_VALUE_MAP[featureName] || 20;
  const visibleBarHeight = Math.max(56, barValue * 1.35);

  return {
    type: "Feature",
    properties: {
      id: "bar-" + (feature.properties.id || String(featureIndex + 1)),
      name: featureName,
      barValue,
      barTopSize: feature.properties.floatElevation + visibleBarHeight,
      barColor: feature.properties.fillColor
    },
    geometry: {
      type: "Point",
      coordinates: anchor
    }
  };
}
