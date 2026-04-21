import { createMapBarGeoJson } from "./create-map-bar-data";

const PRIMARY_REGION_NAME = "余杭区";
const REGION_BLOCK_COLORS = [
  "#1C8DFF",
  "#20C8FF",
  "#3DE6C6",
  "#7EE787",
  "#FFC857",
  "#FF9B71",
  "#A78BFA"
];
const REGION_LABEL_OFFSET_MAP = {
  拱墅区: [-0.018, 0.018]
};

/**
 * 整理地图数据，只保留区块面数据、标签点数据和视角信息三部分。
 */
export function createHangzhouMapData(geoJson) {
  const featureList = getFeatureList(geoJson);
  const polygonFeatureList = featureList.map(createPolygonFeature);
  const featureBounds = calculateFeatureBounds(polygonFeatureList);

  return {
    polygonGeoJson: {
      ...geoJson,
      features: polygonFeatureList
    },
    labelGeoJson: createLabelGeoJson(polygonFeatureList),
    barGeoJson: createMapBarGeoJson(
      polygonFeatureList,
      calculateFeatureAnchor
    ),
    viewState: {
      bounds: [
        [featureBounds.minLng, featureBounds.minLat],
        [featureBounds.maxLng, featureBounds.maxLat]
      ],
      zoom: 7.6
    }
  };
}

/**
 * 统一返回 GeoJSON Feature 列表，避免下游重复判空。
 */
function getFeatureList(geoJson) {
  return geoJson && Array.isArray(geoJson.features) ? geoJson.features : [];
}

/**
 * 为区块面数据补齐地图渲染所需的最小字段。
 */
function createPolygonFeature(feature, featureIndex) {
  const featureName = feature.properties.name;
  const isPrimary = featureName === PRIMARY_REGION_NAME;
  const blockColor = REGION_BLOCK_COLORS[featureIndex % REGION_BLOCK_COLORS.length];

  return {
    ...feature,
    properties: {
      ...feature.properties,
      floatElevation: isPrimary ? 188 : 162,
      fillColor: blockColor,
      borderColor: isPrimary ? "#FFE36A" : "#E6FBFF",
      labelColor: isPrimary ? "#FFFFFF" : "#ECFEFF"
    }
  };
}

/**
 * 为标签层生成 GeoJSON 点数据，交给 PointLayer 文本图层直接消费。
 */
function createLabelGeoJson(featureList) {
  return {
    type: "FeatureCollection",
    features: featureList.map(createLabelPointFeature)
  };
}

/**
 * 为单个区县生成中心点标签数据。
 */
function createLabelPointFeature(feature, featureIndex) {
  const featureName = feature.properties.name;

  return {
    type: "Feature",
    properties: {
      id: feature.properties.id || String(featureIndex + 1),
      name: featureName,
      labelColor: feature.properties.labelColor
    },
    geometry: {
      type: "Point",
      coordinates: calculateLabelCoordinates(feature.geometry, featureName)
    }
  };
}

/**
 * 计算标签最终落点。
 * 默认使用区块包围盒中心；主城区如果存在文字碰撞，再叠加少量人工偏移。
 */
function calculateLabelCoordinates(geometry, featureName) {
  const anchorCoordinates = calculateFeatureAnchor(geometry);
  const coordinateOffset = REGION_LABEL_OFFSET_MAP[featureName];

  if (!coordinateOffset) {
    return anchorCoordinates;
  }

  return [
    anchorCoordinates[0] + coordinateOffset[0],
    anchorCoordinates[1] + coordinateOffset[1]
  ];
}

/**
 * 计算单个区县的标签锚点，使用包围盒中心保持结果稳定。
 */
function calculateFeatureAnchor(geometry) {
  const coordinateList = flattenGeometryCoordinates(geometry);
  const geometryBounds = coordinateList.reduce(
    function collectGeometryBounds(currentBounds, coordinate) {
      const lng = coordinate[0];
      const lat = coordinate[1];

      currentBounds.minLng = Math.min(currentBounds.minLng, lng);
      currentBounds.maxLng = Math.max(currentBounds.maxLng, lng);
      currentBounds.minLat = Math.min(currentBounds.minLat, lat);
      currentBounds.maxLat = Math.max(currentBounds.maxLat, lat);

      return currentBounds;
    },
    {
      minLng: Infinity,
      maxLng: -Infinity,
      minLat: Infinity,
      maxLat: -Infinity
    }
  );

  return [
    (geometryBounds.minLng + geometryBounds.maxLng) / 2,
    (geometryBounds.minLat + geometryBounds.maxLat) / 2
  ];
}

/**
 * 计算整份 GeoJSON 的经纬度边界，用于初始化地图视角。
 */
function calculateFeatureBounds(features) {
  return features.reduce(
    function collectBounds(currentBounds, feature) {
      const coordinateList = flattenGeometryCoordinates(feature.geometry);

      coordinateList.forEach(function updateBounds(coordinate) {
        const lng = coordinate[0];
        const lat = coordinate[1];

        currentBounds.minLng = Math.min(currentBounds.minLng, lng);
        currentBounds.maxLng = Math.max(currentBounds.maxLng, lng);
        currentBounds.minLat = Math.min(currentBounds.minLat, lat);
        currentBounds.maxLat = Math.max(currentBounds.maxLat, lat);
      });

      return currentBounds;
    },
    {
      minLng: Infinity,
      maxLng: -Infinity,
      minLat: Infinity,
      maxLat: -Infinity
    }
  );
}

/**
 * 把 Polygon 和 MultiPolygon 坐标统一拍平成点位数组，便于遍历边界。
 */
function flattenGeometryCoordinates(geometry) {
  const polygonList =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;

  return polygonList.flat(2);
}
