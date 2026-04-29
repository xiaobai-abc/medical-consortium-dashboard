"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { districtBarData } from "./bar-data";

/**
 * 用户明确指定的地图主色。
 * 顶面用更稳的蓝色，侧面用更亮的青色，边界线单独使用浅蓝色强调分区。
 */
const TOP_FACE_COLOR = "#60A6F6";
const SIDE_FACE_COLOR = "#63F6F7";
const BOUNDARY_LINE_COLOR = "#6AE3F5";

/**
 * 下面这些参数专门控制“颜色看起来有多亮”。
 * 如果你后面还觉得发深，优先继续调这几项，不要先去改原始颜色值。
 */
const TOP_EMISSIVE_STRENGTH = 0.34;
const SIDE_EMISSIVE_STRENGTH = 0.24;
const HOVER_TOP_EMISSIVE_STRENGTH = 0.46;
const HOVER_SIDE_EMISSIVE_STRENGTH = 0.34;
const RENDERER_EXPOSURE = 1.1;
const FOG_START_MULTIPLIER = 1.25;
const FOG_END_MULTIPLIER = 3.4;

/**
 * 所有板块统一使用同一个挤出高度。
 * 后面如果你想整体变高或变矮，只改这一个数字。
 */
const BLOCK_HEIGHT = 40;

/**
 * 柱状条相关参数。
 * 这一组专门控制“柱子图层”的视觉。
 * 现在会尽量贴近参考图：细竖条 + 数值牌 + 底部胶囊名称。
 */
const BAR_MAX_HEIGHT = 128; // 柱子的最大高度，数值越大，最高柱子越长
const BAR_MIN_HEIGHT = 72; // 柱子的最小高度，避免低值柱子太短看不见
const BAR_OFFSET_X = 0; // 柱子整体沿 X 轴的偏移量
const BAR_EMISSIVE_STRENGTH = 0.8; // 柱子默认发光强度
const BAR_HOVER_EMISSIVE_STRENGTH = 0.96; // 鼠标悬停柱子时的发光强度
const BAR_RADIUS = 4; // 柱子的粗细，数值越大越粗
const BAR_RADIAL_SEGMENTS = 16; // 圆柱横截面的分段数，越大越圆滑
const BAR_TILT_X_DEGREES = -70; // 柱子绕 X 轴的统一倾斜角度，正负决定前后倾斜方向
const BAR_TILT_Y_DEGREES = 60; // 柱子绕 Y 轴的统一倾斜角度，正负决定左右倾斜方向
const VALUE_LABEL_HITBOX_HEIGHT = 14; // 数值牌命中层的高度，决定鼠标 hover 的纵向可点范围
const VALUE_LABEL_HITBOX_DEPTH = 10; // 数值牌命中层的厚度，给倾斜视角留出 hover 空间
const VALUE_LABEL_OFFSET_X = -20; // 数值牌沿 X 轴的偏移量
const VALUE_LABEL_OFFSET_Y = -20; // 数值牌沿 Y 轴的偏移量，负值会更贴近参考图里的柱身下方
const VALUE_LABEL_MIN_OFFSET_Z = 18; // 数值牌距离板块顶部的最小高度
const VALUE_LABEL_HEIGHT_RATIO = 0.34; // 数值牌跟随柱高上移的比例
const NAME_LABEL_OFFSET_X = -26; // 名称胶囊沿 X 轴的偏移量
const NAME_LABEL_OFFSET_Y = -26; // 名称胶囊沿 Y 轴的偏移量，负值会把标签放到柱子更下方
const NAME_LABEL_OFFSET_Z = 0; // 名称胶囊距离板块顶部的高度
const BAR_DANGER_THRESHOLD = 1000; // 超过这个值使用严重状态颜色
const BAR_WARNING_THRESHOLD = 800; // 超过这个值使用预警状态颜色

const BAR_NORMAL_STYLE = {
  barColor: "#68F2FF", // 普通状态柱子的主颜色
  glowColor: "rgba(104, 242, 255, 0.32)",
  valueTextColor: "#A8F6FF",
  valueBorderColor: "rgba(93, 233, 255, 0.86)",
  valueBackground: "rgba(11, 43, 82, 0.94)",
  nameTextColor: "#A8F6FF",
  nameBorderColor: "rgba(93, 233, 255, 0.82)",
  nameBackground: "rgba(8, 49, 86, 0.74)",
};

const BAR_WARNING_STYLE = {
  barColor: "#FFD34D", // 预警状态柱子的主颜色
  glowColor: "rgba(255, 211, 77, 0.3)",
  valueTextColor: "#FFE680",
  valueBorderColor: "rgba(255, 211, 77, 0.86)",
  valueBackground: "rgba(73, 56, 9, 0.94)",
  nameTextColor: "#FFE680",
  nameBorderColor: "rgba(255, 211, 77, 0.82)",
  nameBackground: "rgba(88, 65, 8, 0.74)",
};

const BAR_DANGER_STYLE = {
  barColor: "#FF4E58", // 严重状态柱子的主颜色
  glowColor: "rgba(255, 78, 88, 0.34)",
  valueTextColor: "#FF9CA2",
  valueBorderColor: "rgba(255, 78, 88, 0.88)",
  valueBackground: "rgba(72, 9, 17, 0.94)",
  nameTextColor: "#FF6670",
  nameBorderColor: "rgba(255, 78, 88, 0.84)",
  nameBackground: "rgba(88, 8, 19, 0.74)",
};

/**
 * hover 浮窗的鼠标偏移，避免浮窗直接挡在光标下面。
 */
const TOOLTIP_OFFSET_X = 18;
const TOOLTIP_OFFSET_Y = 18;

/**
 * 地图默认旋转角度。
 * 这里直接用角度值，后续你想改成 15、30、45 都只改这一个数字。
 * 当前值 30 代表默认逆时针旋转 30 度。
 */
const MAP_ROTATION_DEGREES = 30;

/**
 * 下面这组参数专门控制“默认看地图的角度”。
 * 以后你如果想改视角，优先只改这里：
 * - CAMERA_AZIMUTH_DEGREES: 水平绕地图转到哪个方向看
 * - CAMERA_TILT_DEGREES: 镜头抬高多少，也就是你说的倾斜度
 * - CAMERA_DISTANCE_MULTIPLIER: 镜头离地图有多远
 * - CAMERA_TARGET_Z_MULTIPLIER: 镜头默认看向地图高度的哪个位置
 */ 
const CAMERA_AZIMUTH_DEGREES = -113.72;
const CAMERA_TILT_DEGREES = 68.25;
const CAMERA_DISTANCE_MULTIPLIER = 1.387;
const CAMERA_TARGET_Z_MULTIPLIER = 0.08;
const CAMERA_MIN_POLAR_DEGREES = 20;
const CAMERA_MAX_POLAR_DEGREES = 82;
const ENABLE_CAMERA_DRAG = true; // 是否允许鼠标拖动旋转视角
const SHOW_VIEW_DEBUG_PANEL = true; // 是否显示当前视角参数面板，方便回填默认值
const LOG_VIEW_CONFIG_TO_CONSOLE = true; // 是否在视角变化时把当前参数打印到控制台

/**
 * 悬停高亮时统一往白色方向提亮一点，避免完全变色后丢失原始主题色。
 */
const HOVER_BLEND_COLOR = "#ffffff";

/**
 * 标签相对板块顶部再抬高一点，避免名字贴在面上显得拥挤。
 */
const LABEL_OFFSET_Z = 18;

function removeClosingPoint(ring) {
  if (ring.length < 2) {
    return ring;
  }

  const firstPoint = ring[0];
  const lastPoint = ring[ring.length - 1];

  if (firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1]) {
    return ring.slice(0, -1);
  }

  return ring;
}

function projectPoint(point, center, scale) {
  /**
   * GeoJSON 里的点是经纬度。
   * Three.js 场景里我们需要一个二维平面坐标，所以这里做两件事：
   * 1. 以整张地图中心点为原点，避免坐标值过大。
   * 2. 反转 Y 轴，让屏幕视觉方向和地图阅读方向更自然。
   */
  return new THREE.Vector2(
    (point[0] - center[0]) * scale,
    (point[1] - center[1]) * -scale
  );
}

function normalizeRing(ring, center, scale, shouldBeClockwise) {
  /**
   * Three Shape 对外环和孔洞的方向有要求：
   * - 外环需要一个方向
   * - 内洞需要相反方向
   * 否则挤出后容易出现面翻转或孔洞不正确的问题。
   */
  const normalizedRing = removeClosingPoint(ring).map(function mapPoint(point) {
    return projectPoint(point, center, scale);
  });

  if (normalizedRing.length < 3) {
    return null;
  }

  const isClockwise = THREE.ShapeUtils.isClockWise(normalizedRing);

  if (isClockwise !== shouldBeClockwise) {
    normalizedRing.reverse();
  }

  return normalizedRing;
}

function getGeometryPolygons(feature) {
  /**
   * GeoJSON 里区块可能是 Polygon，也可能是 MultiPolygon。
   * 这里统一转成 polygon 数组，后面渲染层就不用关心数据类型分支。
   */
  if (!feature?.geometry) {
    return [];
  }

  if (feature.geometry.type === "Polygon") {
    return [feature.geometry.coordinates];
  }

  if (feature.geometry.type === "MultiPolygon") {
    return feature.geometry.coordinates;
  }

  return [];
}

function collectBounds(featureCollection) {
  /**
   * 扫描整份 GeoJSON 的边界框，用于：
   * 1. 求地图中心点
   * 2. 根据最大跨度算统一缩放比例
   * 这样不同城市或不同区划数据进来时，地图都能落在一个稳定视野里。
   */
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  featureCollection.features.forEach(function walkFeature(feature) {
    getGeometryPolygons(feature).forEach(function walkPolygon(polygon) {
      polygon.forEach(function walkRing(ring) {
        ring.forEach(function walkPoint(point) {
          minLon = Math.min(minLon, point[0]);
          maxLon = Math.max(maxLon, point[0]);
          minLat = Math.min(minLat, point[1]);
          maxLat = Math.max(maxLat, point[1]);
        });
      });
    });
  });

  return {
    center: [(minLon + maxLon) / 2, (minLat + maxLat) / 2],
    lonSpan: maxLon - minLon,
    latSpan: maxLat - minLat,
  };
}

/**
 * 把某一条 ring 生成一圈边界线。
 * 这里把边界线抬高一点点，避免与顶面完全重合导致闪烁。
 */
function createRingLine(ring, height) {
  const linePoints = ring.map(function mapLinePoint(point) {
    return new THREE.Vector3(point.x, point.y, height + 0.8);
  });
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: BOUNDARY_LINE_COLOR,
    transparent: true,
    opacity: 0.95,
  });
  const line = new THREE.LineLoop(lineGeometry, lineMaterial);

  return {
    line,
    material: lineMaterial,
  };
}

/**
 * 用 shoelace 公式算 ring 面积。
 * 这里只用于找“这个行政区里最大的一块面”，方便把标签放在最主要的板块上。
 */
function getRingArea(ring) {
  let area = 0;

  for (let index = 0; index < ring.length; index += 1) {
    const currentPoint = ring[index];
    const nextPoint = ring[(index + 1) % ring.length];
    area += currentPoint.x * nextPoint.y - nextPoint.x * currentPoint.y;
  }

  return Math.abs(area / 2);
}

/**
 * 标签位置先用 ring 的包围盒中心。
 * 对大多数行政区轮廓来说，这个点足够稳定，也比简单平均点更容易落在图形中部。
 */
function getRingCenter(ring) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  ring.forEach(function walkPoint(point) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });

  return new THREE.Vector3((minX + maxX) / 2, (minY + maxY) / 2, 0);
}

function getBarMetricValue(barDatum) {
  const rawMetricValue = Number(barDatum?.value);

  if (Number.isFinite(rawMetricValue)) {
    return rawMetricValue;
  }

  return 0;
}

/**
 * 独立柱条数组统一使用经纬度坐标。
 * 这里把 [经度, 纬度] 投影成当前 three 场景里的平面坐标。
 */
function resolveProjectedCoordinate(coordinate, center, scale) {
  if (
    Array.isArray(coordinate) &&
    coordinate.length === 2 &&
    Number.isFinite(coordinate[0]) &&
    Number.isFinite(coordinate[1])
  ) {
    const projectedCoordinate = projectPoint(coordinate, center, scale);
    return new THREE.Vector3(projectedCoordinate.x, projectedCoordinate.y, 0);
  }

  return null;
}

/**
 * 柱子等级样式优先按 value 阈值划分。
 * 后面如果接口直接返回 status / level，也可以在这里接进去。
 */
function getBarVisualStyle(metricValue) {
  if (metricValue >= BAR_DANGER_THRESHOLD) {
    return BAR_DANGER_STYLE;
  }

  if (metricValue >= BAR_WARNING_THRESHOLD) {
    return BAR_WARNING_STYLE;
  }

  return BAR_NORMAL_STYLE;
}

/**
 * 区块名称标签使用 CSS2DObject。
 * 好处是文字始终清晰，不需要自己做 canvas 贴图，也方便以后直接改 DOM 样式。
 */
function createFeatureLabel(featureName, labelPosition, height) {
  const labelElement = document.createElement("div");
  labelElement.textContent = featureName;
  labelElement.style.color = "#ffffff";
  labelElement.style.fontSize = "12px";
  labelElement.style.fontWeight = "600";
  labelElement.style.letterSpacing = "0.08em";
  labelElement.style.whiteSpace = "nowrap";
  labelElement.style.pointerEvents = "none";
  labelElement.style.transform = "translate(-50%, -50%)";

  const labelObject = new CSS2DObject(labelElement);
  labelObject.position.set(
    labelPosition.x,
    labelPosition.y,
    height + LABEL_OFFSET_Z
  );

  return {
    labelObject,
    labelElement,
  };
}

/**
 * 柱条底部的数值标签同样走 CSS2D。
 * 这样数字不会被 three 的透视和材质影响，可读性更稳定。
 */
function createValueLabel(metricValue, labelPosition, height, style) {
  const labelElement = document.createElement("div");
  labelElement.textContent = metricValue.toLocaleString("zh-CN");
  labelElement.style.minWidth = "44px";
  labelElement.style.padding = "3px 9px";
  labelElement.style.border = `1px solid ${style.valueBorderColor}`;
  labelElement.style.borderRadius = "5px";
  labelElement.style.background = style.valueBackground;
  labelElement.style.boxShadow = `0 0 18px ${style.glowColor}`;
  labelElement.style.color = style.valueTextColor;
  labelElement.style.fontSize = "12px";
  labelElement.style.fontWeight = "700";
  labelElement.style.lineHeight = "1";
  labelElement.style.textAlign = "center";
  labelElement.style.fontVariantNumeric = "tabular-nums";
  labelElement.style.letterSpacing = "0.04em";
  labelElement.style.whiteSpace = "nowrap";
  labelElement.style.pointerEvents = "none";
  labelElement.style.transform = "translate(-50%, -50%)";

  const labelObject = new CSS2DObject(labelElement);
  labelObject.position.set(labelPosition.x, labelPosition.y, height);

  return {
    labelObject,
    labelElement,
  };
}

function createBarNameLabel(name, labelPosition, height, style) {
  const labelElement = document.createElement("div");
  labelElement.textContent = name;
  labelElement.style.padding = "4px 14px";
  labelElement.style.border = `1px solid ${style.nameBorderColor}`;
  labelElement.style.borderRadius = "999px";
  labelElement.style.background = style.nameBackground;
  labelElement.style.boxShadow = `0 0 20px ${style.glowColor}`;
  labelElement.style.color = style.nameTextColor;
  labelElement.style.fontSize = "11px";
  labelElement.style.fontWeight = "500";
  labelElement.style.lineHeight = "1";
  labelElement.style.letterSpacing = "0.02em";
  labelElement.style.whiteSpace = "nowrap";
  labelElement.style.pointerEvents = "none";
  labelElement.style.transform = "translate(-50%, -50%)";

  const labelObject = new CSS2DObject(labelElement);
  labelObject.position.set(labelPosition.x, labelPosition.y, height);

  return {
    labelObject,
    labelElement,
  };
}

function createValueLabelHitMesh(metricValue, labelPosition, height, barIndex) {
  /**
   * 数值牌本身是 CSS2D DOM，不会参与 three 的射线命中。
   * 这里在它后面补一个透明命中盒，让鼠标移到数字牌区域时也能触发柱子 hover。
   */
  const labelText = metricValue.toLocaleString("zh-CN");
  const hitboxWidth = Math.max(44, labelText.length * 12 + 20);
  const hitboxGeometry = new THREE.BoxGeometry(
    hitboxWidth,
    VALUE_LABEL_HITBOX_HEIGHT,
    VALUE_LABEL_HITBOX_DEPTH
  );
  const hitboxMaterial = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const hitboxMesh = new THREE.Mesh(hitboxGeometry, hitboxMaterial);

  hitboxMesh.position.set(labelPosition.x, labelPosition.y, height);
  hitboxMesh.userData = {
    hoverKind: "bar",
    barIndex,
  };

  return hitboxMesh;
}

/**
 * 根据“水平角度 + 倾斜度 + 距离”计算默认相机位置。
 * 这样后面调视角时，你不需要再手算 x/y/z。
 */
function getDefaultCameraPosition(maxSpan) {
  const azimuthRadians = THREE.MathUtils.degToRad(CAMERA_AZIMUTH_DEGREES);
  const tiltRadians = THREE.MathUtils.degToRad(CAMERA_TILT_DEGREES);
  const cameraDistance = maxSpan * CAMERA_DISTANCE_MULTIPLIER;
  const horizontalDistance = Math.cos(tiltRadians) * cameraDistance;
  const verticalDistance = Math.sin(tiltRadians) * cameraDistance;

  return new THREE.Vector3(
    Math.cos(azimuthRadians) * horizontalDistance,
    Math.sin(azimuthRadians) * horizontalDistance,
    verticalDistance
  );
}

function getCurrentViewConfig(camera, controls, maxSpan, mapRotationRadians) {
  /**
   * 当前默认视角使用“方位角 + 倾斜度 + 距离倍率 + 目标高度倍率”来描述。
   * 这里把用户拖动后的真实相机状态反算回这组参数，方便直接复制到顶部常量。
   */
  const cameraOffset = camera.position.clone().sub(controls.target);
  const cameraDistance = cameraOffset.length();
  const horizontalDistance = Math.sqrt(
    cameraOffset.x * cameraOffset.x + cameraOffset.y * cameraOffset.y
  );

  return {
    mapRotationDegrees: Number(
      THREE.MathUtils.radToDeg(mapRotationRadians).toFixed(2)
    ),
    cameraAzimuthDegrees: Number(
      THREE.MathUtils.radToDeg(
        Math.atan2(cameraOffset.y, cameraOffset.x)
      ).toFixed(2)
    ),
    cameraTiltDegrees: Number(
      THREE.MathUtils.radToDeg(
        Math.atan2(cameraOffset.z, horizontalDistance)
      ).toFixed(2)
    ),
    cameraDistanceMultiplier: Number((cameraDistance / maxSpan).toFixed(3)),
    cameraTargetZMultiplier: Number((controls.target.z / maxSpan).toFixed(3)),
  };
}

function formatViewConfigText(viewConfig) {
  return [
    `MAP_ROTATION_DEGREES = ${viewConfig.mapRotationDegrees}`,
    `CAMERA_AZIMUTH_DEGREES = ${viewConfig.cameraAzimuthDegrees}`,
    `CAMERA_TILT_DEGREES = ${viewConfig.cameraTiltDegrees}`,
    `CAMERA_DISTANCE_MULTIPLIER = ${viewConfig.cameraDistanceMultiplier}`,
    `CAMERA_TARGET_Z_MULTIPLIER = ${viewConfig.cameraTargetZMultiplier}`,
  ].join("\n");
}

function buildDistrictMeshes(featureCollection) {
  /**
   * 这一步把 GeoJSON 真正转成 three 可渲染的数据：
   * - 每个行政区转成一个或多个挤出后的 Mesh
   * - 每个行政区额外生成边界线
   * - 返回一个 featureEntries，供 hover 命中和高亮复用
   */
  const bounds = collectBounds(featureCollection);
  const dominantSpan = Math.max(bounds.lonSpan, bounds.latSpan);
  const scale = dominantSpan === 0 ? 1 : 900 / dominantSpan;
  const featureEntries = [];
  const mapGroup = new THREE.Group();

  featureCollection.features.forEach(function buildFeature(feature, featureIndex) {
    const polygons = getGeometryPolygons(feature);
    const topFaceColor = new THREE.Color(TOP_FACE_COLOR);
    const sideFaceColor = new THREE.Color(SIDE_FACE_COLOR);
    const featureHeight = BLOCK_HEIGHT;
    const featureName = feature.properties?.name || `区域 ${featureIndex + 1}`;
    const meshes = [];
    const outlineMaterials = [];
    let labelAnchorPoint = null;
    let largestPolygonArea = 0;

    polygons.forEach(function buildPolygon(polygon) {
      const outerRing = normalizeRing(
        polygon[0] || [],
        bounds.center,
        scale,
        true
      );

      if (!outerRing) {
        return;
      }

      const shape = new THREE.Shape(outerRing);
      const outerRingArea = getRingArea(outerRing);

      if (outerRingArea > largestPolygonArea) {
        largestPolygonArea = outerRingArea;
        labelAnchorPoint = getRingCenter(outerRing);
      }

      polygon.slice(1).forEach(function buildHole(holeRing) {
        const normalizedHole = normalizeRing(
          holeRing,
          bounds.center,
          scale,
          false
        );

        if (!normalizedHole) {
          return;
        }

        const holePath = new THREE.Path(normalizedHole);
        shape.holes.push(holePath);
      });

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: featureHeight,
        bevelEnabled: false,
        curveSegments: 2,
      });

      /**
       * ExtrudeGeometry 支持多材质：
       * - 第一个材质用于顶面/底面
       * - 第二个材质用于挤出的侧面
       * 这样就能把顶面和侧面拆成两种颜色。
       */
      const topMaterial = new THREE.MeshStandardMaterial({
        color: topFaceColor.clone(),
        emissive: topFaceColor.clone().multiplyScalar(TOP_EMISSIVE_STRENGTH),
        metalness: 0.14,
        roughness: 0.4,
      });
      const sideMaterial = new THREE.MeshStandardMaterial({
        color: sideFaceColor.clone(),
        emissive: sideFaceColor.clone().multiplyScalar(SIDE_EMISSIVE_STRENGTH),
        metalness: 0.08,
        roughness: 0.52,
      });

      const mesh = new THREE.Mesh(geometry, [topMaterial, sideMaterial]);
      mesh.userData = {
        featureIndex,
        featureName,
        baseTopColor: topFaceColor.clone(),
        baseSideColor: sideFaceColor.clone(),
      };
      mapGroup.add(mesh);
      meshes.push(mesh);

      /**
       * 外环边界线就是行政区之间最直接的视觉分隔。
       * 当相邻板块顶面颜色一致时，这条线能把“板块与板块之间的边”明确打出来。
       */
      const outerRingLine = createRingLine(outerRing, featureHeight);
      mapGroup.add(outerRingLine.line);
      outlineMaterials.push(outerRingLine.material);

      /**
       * 如果某个区块内部存在孔洞，也给孔洞边界补线。
       * 这样地形轮廓会更完整。
       */
      polygon.slice(1).forEach(function buildHoleBoundary(holeRing) {
        const normalizedHole = normalizeRing(
          holeRing,
          bounds.center,
          scale,
          false
        );

        if (!normalizedHole) {
          return;
        }

        const holeRingLine = createRingLine(normalizedHole, featureHeight);
        mapGroup.add(holeRingLine.line);
        outlineMaterials.push(holeRingLine.material);
      });
    });

    /**
     * 每个行政区只放一个标签。
     * MultiPolygon 的情况下，标签放在面积最大的那块面上。
     */
    let labelElement = null;
    if (labelAnchorPoint) {
      const { labelObject, labelElement: nextLabelElement } = createFeatureLabel(
        featureName,
        labelAnchorPoint,
        featureHeight
      );
      mapGroup.add(labelObject);
      labelElement = nextLabelElement;
    }

    featureEntries.push({
      featureIndex,
      featureName,
      baseTopColor: topFaceColor,
      baseSideColor: sideFaceColor,
      height: featureHeight,
      meshes,
      outlineMaterials,
      labelElement,
    });
  });

  const maxSpan = Math.max(bounds.lonSpan, bounds.latSpan) * scale;

  return {
    bounds,
    mapGroup,
    featureEntries,
    maxSpan,
    scale,
  };
}

function buildBarOverlays(barData, bounds, scale) {
  const barEntries = [];
  const barGroup = new THREE.Group();
  const barMetricValues = barData.map(function mapBarMetricValue(item) {
    return getBarMetricValue(item);
  });
  const maxBarMetricValue = Math.max(...barMetricValues, 1);

  barData.forEach(function buildBarEntry(barDatum, barIndex) {
    const metricValue = getBarMetricValue(barDatum);
    const projectedAnchorPoint = resolveProjectedCoordinate(
      barDatum?.coordinate,
      bounds.center,
      scale
    );

    if (!projectedAnchorPoint) {
      return;
    }

    const normalizedMetricValue = metricValue / maxBarMetricValue;
    const barHeight = Math.max(
      BAR_MIN_HEIGHT,
      normalizedMetricValue * BAR_MAX_HEIGHT
    );
    const barStyle = getBarVisualStyle(metricValue);
    const barColor = new THREE.Color(barStyle.barColor);
    const valueLabelZ =
      BLOCK_HEIGHT +
      Math.max(VALUE_LABEL_MIN_OFFSET_Z, barHeight * VALUE_LABEL_HEIGHT_RATIO);
    const nameLabelZ = BLOCK_HEIGHT + NAME_LABEL_OFFSET_Z;
    const barGeometry = new THREE.CylinderGeometry(
      BAR_RADIUS,
      BAR_RADIUS,
      barHeight,
      BAR_RADIAL_SEGMENTS
    );
    barGeometry.rotateX(Math.PI / 2);

    const barMaterial = new THREE.MeshStandardMaterial({
      color: barColor.clone(),
      emissive: barColor.clone().multiplyScalar(BAR_EMISSIVE_STRENGTH),
      metalness: 0.08,
      roughness: 0.32,
    });

    const barMesh = new THREE.Mesh(barGeometry, barMaterial);
    barMesh.position.set(
      projectedAnchorPoint.x + BAR_OFFSET_X,
      projectedAnchorPoint.y,
      BLOCK_HEIGHT + barHeight / 2
    );
    barMesh.rotation.x = THREE.MathUtils.degToRad(BAR_TILT_X_DEGREES);
    barMesh.rotation.y = THREE.MathUtils.degToRad(BAR_TILT_Y_DEGREES);
    barMesh.userData = {
      hoverKind: "bar",
      barIndex,
    };
    barGroup.add(barMesh);

    const {
      labelObject: valueLabelObject,
      labelElement: valueLabelElement,
    } = createValueLabel(
      metricValue,
      new THREE.Vector3(
        projectedAnchorPoint.x + BAR_OFFSET_X + VALUE_LABEL_OFFSET_X,
        projectedAnchorPoint.y + VALUE_LABEL_OFFSET_Y,
        0
      ),
      valueLabelZ,
      barStyle
    );
    barGroup.add(valueLabelObject);
    const valueLabelHitMesh = createValueLabelHitMesh(
      metricValue,
      new THREE.Vector3(
        projectedAnchorPoint.x + BAR_OFFSET_X + VALUE_LABEL_OFFSET_X,
        projectedAnchorPoint.y + VALUE_LABEL_OFFSET_Y,
        0
      ),
      valueLabelZ,
      barIndex
    );
    barGroup.add(valueLabelHitMesh);

    const {
      labelObject: nameLabelObject,
      labelElement: nameLabelElement,
    } = createBarNameLabel(
      barDatum?.name || `点位 ${barIndex + 1}`,
      new THREE.Vector3(
        projectedAnchorPoint.x + BAR_OFFSET_X + NAME_LABEL_OFFSET_X,
        projectedAnchorPoint.y + NAME_LABEL_OFFSET_Y,
        0
      ),
      nameLabelZ,
      barStyle
    );
    barGroup.add(nameLabelObject);

    barEntries.push({
      barIndex,
      name: barDatum?.name || `点位 ${barIndex + 1}`,
      metricValue,
      barHeight,
      barMesh,
      valueLabelHitMesh,
      valueLabelElement,
      nameLabelElement,
      baseColor: barColor,
      style: barStyle,
    });
  });

  return {
    barEntries,
    barGroup,
  };
}

function setFeatureHighlight(featureEntries, activeFeatureIndex) {
  /**
   * 悬停高亮策略：
   * - 顶面和侧面分别提亮，保证层次还在
   * - 当前板块轻微抬高，给用户一个明显但不夸张的交互反馈
   * - 边界线提亮成白色
   */
  featureEntries.forEach(function updateFeature(featureEntry) {
    const isActive = featureEntry.featureIndex === activeFeatureIndex;

    featureEntry.meshes.forEach(function updateMesh(mesh) {
      const nextTopColor = isActive
        ? mesh.userData.baseTopColor
            .clone()
            .lerp(new THREE.Color(HOVER_BLEND_COLOR), 0.22)
        : mesh.userData.baseTopColor;
      const nextSideColor = isActive
        ? mesh.userData.baseSideColor
            .clone()
            .lerp(new THREE.Color(HOVER_BLEND_COLOR), 0.18)
        : mesh.userData.baseSideColor;

      mesh.material[0].color.copy(nextTopColor);
      mesh.material[0].emissive.copy(
        isActive
          ? mesh.userData.baseTopColor
              .clone()
              .multiplyScalar(HOVER_TOP_EMISSIVE_STRENGTH)
          : mesh.userData.baseTopColor
              .clone()
              .multiplyScalar(TOP_EMISSIVE_STRENGTH)
      );

      mesh.material[1].color.copy(nextSideColor);
      mesh.material[1].emissive.copy(
        isActive
          ? mesh.userData.baseSideColor
              .clone()
              .multiplyScalar(HOVER_SIDE_EMISSIVE_STRENGTH)
          : mesh.userData.baseSideColor
              .clone()
              .multiplyScalar(SIDE_EMISSIVE_STRENGTH)
      );

      mesh.position.z = isActive ? 8 : 0;
    });

    featureEntry.outlineMaterials.forEach(function updateLineMaterial(material) {
      material.color.set(isActive ? "#ffffff" : BOUNDARY_LINE_COLOR);
      material.opacity = isActive ? 1 : 0.95;
    });

    if (featureEntry.labelElement) {
      featureEntry.labelElement.style.color = "#ffffff";
      featureEntry.labelElement.style.opacity = isActive ? "1" : "0.92";
    }
  });
}

function setBarHighlight(barEntries, activeBarIndex) {
  barEntries.forEach(function updateBarEntry(barEntry) {
    const isActive = barEntry.barIndex === activeBarIndex;
    const nextBarColor = isActive
      ? barEntry.baseColor.clone().lerp(new THREE.Color(HOVER_BLEND_COLOR), 0.22)
      : barEntry.baseColor;

    barEntry.barMesh.material.color.copy(nextBarColor);
    barEntry.barMesh.material.emissive.copy(
      isActive
        ? barEntry.baseColor.clone().multiplyScalar(BAR_HOVER_EMISSIVE_STRENGTH)
        : barEntry.baseColor.clone().multiplyScalar(BAR_EMISSIVE_STRENGTH)
    );
    barEntry.barMesh.position.z = isActive
      ? BLOCK_HEIGHT + barEntry.barHeight / 2 + 8
      : BLOCK_HEIGHT + barEntry.barHeight / 2;

    if (barEntry.valueLabelElement) {
      barEntry.valueLabelElement.style.color = isActive
        ? "#ffffff"
        : barEntry.style.valueTextColor;
      barEntry.valueLabelElement.style.borderColor = isActive
        ? "rgba(255,255,255,0.88)"
        : barEntry.style.valueBorderColor;
      barEntry.valueLabelElement.style.boxShadow = isActive
        ? "0 0 20px rgba(255,255,255,0.16)"
        : `0 0 16px ${barEntry.style.glowColor}`;
      barEntry.valueLabelElement.style.opacity = isActive ? "1" : "0.94";
    }

    if (barEntry.nameLabelElement) {
      barEntry.nameLabelElement.style.color = isActive
        ? "#ffffff"
        : barEntry.style.nameTextColor;
      barEntry.nameLabelElement.style.borderColor = isActive
        ? "rgba(255,255,255,0.88)"
        : barEntry.style.nameBorderColor;
      barEntry.nameLabelElement.style.boxShadow = isActive
        ? "0 0 22px rgba(255,255,255,0.14)"
        : `0 0 18px ${barEntry.style.glowColor}`;
      barEntry.nameLabelElement.style.opacity = isActive ? "1" : "0.96";
    }
  });
}

function ThreeBlockMap({
  showTopOverlay = true,
  showInfoPanel = true,
  showViewDebugPanel = SHOW_VIEW_DEBUG_PANEL,
  enableCameraDrag = ENABLE_CAMERA_DRAG,
  logViewConfigToConsole = LOG_VIEW_CONFIG_TO_CONSOLE,
}) {
  const containerRef = useRef(null);
  const infoRef = useRef(null);
  const tooltipRef = useRef(null);
  const tooltipNameRef = useRef(null);
  const tooltipValueRef = useRef(null);
  const tooltipHeightRef = useRef(null);
  const viewDebugRef = useRef(null);

  useEffect(function initThreeMapEffect() {
    const containerElement = containerRef.current;

    if (!containerElement) {
      return;
    }

    let animationFrameId = 0;
    let disposed = false;
    let activeFeatureIndex = null;
    let activeBarIndex = null;
    let lastViewLogAt = 0;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const cleanupTasks = [];

    async function initScene() {
      /**
       * 这里直接读取 public 下的静态 GeoJSON。
       * 因为 test 页只是本地实验页，不需要再抽一层数据请求封装。
       */
      const response = await fetch("/json/330100.geojson");
      const geoJson = await response.json();

      if (disposed) {
        return;
      }

      const { bounds, mapGroup, featureEntries, maxSpan, scale } =
        buildDistrictMeshes(geoJson);
      const { barEntries, barGroup } = buildBarOverlays(
        districtBarData,
        bounds,
        scale
      );
      /**
       * 地图整体默认朝向在这里控制。
       * 改角度时优先改顶部的 MAP_ROTATION_DEGREES，不要直接写死弧度值。
       */
      mapGroup.rotation.z = THREE.MathUtils.degToRad(MAP_ROTATION_DEGREES);
      barGroup.rotation.z = THREE.MathUtils.degToRad(MAP_ROTATION_DEGREES);
      const meshTargets = [
        ...featureEntries.flatMap(function flattenFeature(feature) {
          return feature.meshes;
        }),
        ...barEntries.flatMap(function mapBarEntry(barEntry) {
          return [barEntry.barMesh, barEntry.valueLabelHitMesh];
        }),
      ];

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#031525");
      scene.fog = new THREE.Fog(
        "#031525",
        maxSpan * FOG_START_MULTIPLIER,
        maxSpan * FOG_END_MULTIPLIER
      );

      /**
       * 默认展示角度由文件顶部那组 CAMERA_* 常量决定。
       * 这里不再手写 position 数字，而是根据“旋转角度 + 倾斜度 + 距离”自动换算。
       */
      const camera = new THREE.PerspectiveCamera(
        42,
        containerElement.clientWidth / containerElement.clientHeight,
        1,
        5000
      );
      /**
       * 这张地图的“朝上方向”是 z 轴，不是 OrbitControls 默认理解的 y 轴。
       * 这里显式切到 z-up，拖拽俯仰才会符合当前地图坐标系。
       */
      camera.up.set(0, 0, 1);
      camera.position.copy(getDefaultCameraPosition(maxSpan));

      /**
       * 渲染器是 three 的真正画布输出端。
       * 这里保留抗锯齿和色彩空间设置，让板块边缘和蓝青色系更稳定。
       */
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(
        containerElement.clientWidth,
        containerElement.clientHeight
      );
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = RENDERER_EXPOSURE;
      containerElement.appendChild(renderer.domElement);

      /**
       * 标签渲染器专门负责区块名称。
       * 它和 WebGLRenderer 共用同一套相机，但输出的是 DOM。
       */
      const labelRenderer = new CSS2DRenderer();
      labelRenderer.setSize(
        containerElement.clientWidth,
        containerElement.clientHeight
      );
      labelRenderer.domElement.style.position = "absolute";
      labelRenderer.domElement.style.top = "0";
      labelRenderer.domElement.style.left = "0";
      labelRenderer.domElement.style.pointerEvents = "none";
      containerElement.appendChild(labelRenderer.domElement);

      /**
       * 交互控制器：
       * - 允许用户手动旋转/缩放
       * - 明确关闭默认自动旋转
       * - 目标点抬高一点，让镜头视线更贴近地图中部
       */
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.enableRotate = enableCameraDrag;
      controls.minDistance = maxSpan * 0.45;
      controls.maxDistance = maxSpan * 2;
      controls.minPolarAngle = THREE.MathUtils.degToRad(
        CAMERA_MIN_POLAR_DEGREES
      );
      controls.maxPolarAngle = THREE.MathUtils.degToRad(
        CAMERA_MAX_POLAR_DEGREES
      );
      controls.target.set(0, 0, maxSpan * CAMERA_TARGET_Z_MULTIPLIER);
      controls.autoRotate = false;

      function syncViewDebug(forceConsoleLog = false) {
        const viewConfig = getCurrentViewConfig(
          camera,
          controls,
          maxSpan,
          mapGroup.rotation.z
        );
        const viewConfigText = formatViewConfigText(viewConfig);

        if (showViewDebugPanel && viewDebugRef.current) {
          viewDebugRef.current.textContent = viewConfigText;
        }

        if (!logViewConfigToConsole) {
          return;
        }

        const now = Date.now();
        if (!forceConsoleLog && now - lastViewLogAt < 120) {
          return;
        }

        lastViewLogAt = now;
        console.info("[ThreeMapView]", viewConfig);
      }

      /**
       * 三组光源分别负责：
       * - ambient: 整体补光
       * - directional: 主光，决定顶面层次
       * - rimLight: 侧边轮廓光，让侧面青色更明显
       */
      const ambientLight = new THREE.AmbientLight("#7dd3fc", 1.8);
      const directionalLight = new THREE.DirectionalLight("#ffffff", 1.6);
      directionalLight.position.set(-260, -320, 480);
      const rimLight = new THREE.DirectionalLight("#60a5fa", 1.1);
      rimLight.position.set(260, 200, 240);

      /**
       * 地图下方的底板只是为了给悬浮出来的板块一个承托面。
       * 它不参与 hover 命中。
       */
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(maxSpan * 1.75, maxSpan * 1.75),
        new THREE.MeshBasicMaterial({
          color: "#07203b",
          transparent: true,
          opacity: 0.55,
        })
      );
      plane.position.z = -8;

      scene.add(ambientLight);
      scene.add(directionalLight);
      scene.add(rimLight);
      scene.add(plane);
      scene.add(mapGroup);
      scene.add(barGroup);
      syncViewDebug(true);

      function handleResize() {
        /**
         * 容器尺寸变化时，同时更新相机宽高比和 renderer 大小。
         * 否则画面会拉伸。
         */
        const nextWidth = containerElement.clientWidth;
        const nextHeight = containerElement.clientHeight;

        if (!nextWidth || !nextHeight) {
          return;
        }

        camera.aspect = nextWidth / nextHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(nextWidth, nextHeight);
        labelRenderer.setSize(nextWidth, nextHeight);
      }

      function updateHoverState(nextHoverTarget) {
        /**
         * 如果 hover 没变，不做重复更新，避免无意义的材质写入。
         */
        const nextFeatureIndex =
          nextHoverTarget?.kind === "feature" ? nextHoverTarget.index : null;
        const nextBarIndex =
          nextHoverTarget?.kind === "bar" ? nextHoverTarget.index : null;

        if (
          activeFeatureIndex === nextFeatureIndex &&
          activeBarIndex === nextBarIndex
        ) {
          return;
        }

        activeFeatureIndex = nextFeatureIndex;
        activeBarIndex = nextBarIndex;
        setFeatureHighlight(featureEntries, activeFeatureIndex);
        setBarHighlight(barEntries, activeBarIndex);

        if (!infoRef.current) {
          return;
        }

        if (activeBarIndex === null) {
          infoRef.current.textContent = "悬停柱子查看点位详情";
          if (tooltipRef.current) {
            tooltipRef.current.style.opacity = "0";
          }
          return;
        }

        const activeBar =
          activeBarIndex === null
            ? null
            : barEntries.find(function findBarEntry(barEntry) {
                return barEntry.barIndex === activeBarIndex;
              });

        infoRef.current.textContent = activeBar
          ? `${activeBar.name} · 数值 ${activeBar.metricValue.toLocaleString("zh-CN")}`
          : "悬停柱子查看点位详情";

        if (
          activeBar &&
          tooltipRef.current &&
          tooltipNameRef.current &&
          tooltipValueRef.current &&
          tooltipHeightRef.current
        ) {
          tooltipNameRef.current.textContent = activeBar
            ? activeBar.name
            : "";
          tooltipValueRef.current.textContent = activeBar
            ? activeBar.metricValue.toLocaleString("zh-CN")
            : "-";
          tooltipHeightRef.current.textContent = activeBar
            ? `${Math.round(activeBar.barHeight)}`
            : "-";
          tooltipRef.current.style.opacity = "1";
        }
      }

      function updateTooltipPosition(event) {
        if (!tooltipRef.current) {
          return;
        }

        const containerRect = containerElement.getBoundingClientRect();
        tooltipRef.current.style.left = `${event.clientX - containerRect.left + TOOLTIP_OFFSET_X}px`;
        tooltipRef.current.style.top = `${event.clientY - containerRect.top + TOOLTIP_OFFSET_Y}px`;
      }

      function handlePointerMove(event) {
        /**
         * 把屏幕坐标换算成 three 的标准化设备坐标，再做射线检测。
         * 命中的 mesh 上已经带了 featureIndex，所以可以直接反查区块。
         */
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersections = raycaster.intersectObjects(meshTargets, false);
        const intersectionObject = intersections[0]?.object;
        const nextHoverTarget =
          intersectionObject?.userData?.hoverKind === "bar"
            ? {
                kind: "bar",
                index: intersectionObject.userData.barIndex,
              }
            : intersectionObject
              ? {
                  kind: "feature",
                  index: intersectionObject.userData.featureIndex,
                }
              : null;

        updateHoverState(nextHoverTarget);

        if (nextHoverTarget?.kind === "bar") {
          updateTooltipPosition(event);
        }
      }

      function handlePointerLeave() {
        updateHoverState(null);
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = "0";
        }
      }

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerElement);
      cleanupTasks.push(function cleanupResizeObserver() {
        resizeObserver.disconnect();
      });

      renderer.domElement.addEventListener("pointermove", handlePointerMove);
      renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
      cleanupTasks.push(function cleanupPointerEvents() {
        renderer.domElement.removeEventListener("pointermove", handlePointerMove);
        renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      });

      function handleControlsEnd() {
        syncViewDebug(true);
      }

      controls.addEventListener("change", syncViewDebug);
      controls.addEventListener("end", handleControlsEnd);
      cleanupTasks.push(function cleanupControlEvents() {
        controls.removeEventListener("change", syncViewDebug);
        controls.removeEventListener("end", handleControlsEnd);
      });

      function renderFrame() {
        /**
         * 每一帧只做两件事：
         * 1. 更新 controls 的阻尼过渡
         * 2. 渲染场景
         */
        if (disposed) {
          return;
        }

        animationFrameId = window.requestAnimationFrame(renderFrame);
        controls.update();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
      }

      renderFrame();

      cleanupTasks.push(function cleanupThreeResources() {
        /**
         * three 手动管理资源比较多。
         * 这里在组件卸载时把动画、controls、geometry、material、renderer 全部清掉。
         */
        window.cancelAnimationFrame(animationFrameId);
        controls.dispose();

        scene.traverse(function disposeNode(node) {
          if (node.geometry) {
            node.geometry.dispose();
          }

          if (Array.isArray(node.material)) {
            node.material.forEach(function disposeMaterial(material) {
              material.dispose();
            });
          } else if (node.material) {
            node.material.dispose();
          }
        });

        renderer.dispose();
        renderer.domElement.remove();
        labelRenderer.domElement.remove();
      });
    }

    initScene().catch(function handleInitSceneError(error) {
      console.error("Init Three block map failed", error);

      if (infoRef.current) {
        infoRef.current.textContent = "Three.js 地图初始化失败";
      }
    });

    return function cleanupThreeMapEffect() {
      disposed = true;
      cleanupTasks.reverse().forEach(function runCleanup(cleanupTask) {
        cleanupTask();
      });
    };
  }, [enableCameraDrag, logViewConfigToConsole, showViewDebugPanel]);

  return (
    <section className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full rounded-3xl" />
      {showTopOverlay || showInfoPanel ? (
        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between">
          {showTopOverlay ? (
            <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/55 px-4 py-3 backdrop-blur">
              <p className="text-xs tracking-[0.3em] text-cyan-300/75">
                THREE MAP
              </p>
              <p className="mt-1 text-lg text-white">杭州区县 3D 板块地图</p>
            </div>
          ) : (
            <div />
          )}
          {showInfoPanel ? (
            <div
              ref={infoRef}
              className="rounded-2xl border border-cyan-400/20 bg-slate-950/55 px-4 py-3 text-sm text-cyan-50 backdrop-blur">
              悬停柱子查看点位详情
            </div>
          ) : null}
        </div>
      ) : (
        <div ref={infoRef} className="hidden">
          悬停柱子查看点位详情
        </div>
      )}
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute left-0 top-0 z-20 min-w-[180px] rounded-2xl border border-cyan-300/35 bg-[#061629]/92 px-4 py-3 text-white opacity-0 shadow-[0_0_28px_rgba(96,166,246,0.2)] backdrop-blur transition-opacity">
        <p className="text-[11px] tracking-[0.24em] text-cyan-200/72">DETAIL</p>
        <p ref={tooltipNameRef} className="mt-1 text-sm font-semibold text-white">
          区块名称
        </p>
        <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          <span className="text-cyan-100/62">数值</span>
          <span ref={tooltipValueRef} className="text-right text-cyan-50">
            -
          </span>
          <span className="text-cyan-100/62">板块高度</span>
          <span ref={tooltipHeightRef} className="text-right text-cyan-50">
            -
          </span>
        </div>
      </div>
      {showViewDebugPanel ? (
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-[340px] rounded-2xl border border-cyan-400/20 bg-slate-950/60 px-4 py-3 backdrop-blur">
          <p className="text-[11px] tracking-[0.24em] text-cyan-300/72">
            VIEW CONFIG
          </p>
          <pre
            ref={viewDebugRef}
            className="mt-2 whitespace-pre-wrap text-xs leading-5 text-cyan-50">
            MAP_ROTATION_DEGREES = {MAP_ROTATION_DEGREES}
            {"\n"}
            CAMERA_AZIMUTH_DEGREES = {CAMERA_AZIMUTH_DEGREES}
            {"\n"}
            CAMERA_TILT_DEGREES = {CAMERA_TILT_DEGREES}
            {"\n"}
            CAMERA_DISTANCE_MULTIPLIER = {CAMERA_DISTANCE_MULTIPLIER}
            {"\n"}
            CAMERA_TARGET_Z_MULTIPLIER = {CAMERA_TARGET_Z_MULTIPLIER}
          </pre>
        </div>
      ) : null}
    </section>
  );
}

export default ThreeBlockMap;
