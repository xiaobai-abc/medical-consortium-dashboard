"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DObject,
  CSS2DRenderer
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import {
  BAR_NORMAL_STYLE,
  MapDetailTooltipCard,
  createReactBarMarkerObject,
  getBarHeight,
  getBarVisualStyle,
  updateReactBarMarkerObject
} from "./react-bar-marker";
import { hangzhouDistrictCoordinateMap } from "./home-district-coordinate-map";
import homeThreeBlockMapConfig from "./home-three-block-map-config";

const mapConfig = homeThreeBlockMapConfig;

let hangzhouGeoJsonPromise = null;

function getHangzhouGeoJson() {
  if (!hangzhouGeoJsonPromise) {
    hangzhouGeoJsonPromise = fetch("/json/330100.geojson").then(
      function parseHangzhouGeoJson(response) {
        return response.json();
      }
    );
  }

  return hangzhouGeoJsonPromise;
}

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

function restoreCoordinate(projectedPoint, center, scale) {
  if (!projectedPoint || !scale) {
    return null;
  }

  return [
    Number((projectedPoint.x / scale + center[0]).toFixed(6)),
    Number((center[1] - projectedPoint.y / scale).toFixed(6))
  ];
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
    latSpan: maxLat - minLat
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
    color: mapConfig.colors.boundaryLine,
    transparent: true,
    opacity: 0.95
  });
  const line = new THREE.LineLoop(lineGeometry, lineMaterial);

  return {
    line,
    material: lineMaterial
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
  labelElement.style.zIndex = "1";

  const labelObject = new CSS2DObject(labelElement);
  labelObject.renderOrder = 1;
  labelObject.position.set(
    labelPosition.x,
    labelPosition.y,
    height + mapConfig.map.labelOffsetZ
  );

  return {
    labelObject,
    labelElement
  };
}

function normalizeDistrictName(name) {
  return String(name || "").trim();
}

function toSafeNumber(value, fallback = 0) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

function getProjectedBarAnchorPoint(featureEntry, bounds, scale) {
  const mappedCoordinate =
    hangzhouDistrictCoordinateMap[normalizeDistrictName(featureEntry.featureName)];

  if (Array.isArray(mappedCoordinate) && mappedCoordinate.length === 2) {
    return projectPoint(mappedCoordinate, bounds.center, scale);
  }

  return featureEntry.labelAnchorPoint;
}

/**
 * 根据“水平角度 + 倾斜度 + 距离”计算默认相机位置。
 * 这样后面调视角时，你不需要再手算 x/y/z。
 */
function getDefaultCameraPosition(maxSpan) {
  const azimuthRadians = THREE.MathUtils.degToRad(
    mapConfig.camera.azimuthDegrees
  );
  const tiltRadians = THREE.MathUtils.degToRad(mapConfig.camera.tiltDegrees);
  const cameraDistance = maxSpan * mapConfig.camera.distanceMultiplier;
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
    cameraTargetZMultiplier: Number((controls.target.z / maxSpan).toFixed(3))
  };
}

function formatViewConfigText(viewConfig) {
  return [
    `map.rotationDegrees = ${viewConfig.mapRotationDegrees}`,
    `camera.azimuthDegrees = ${viewConfig.cameraAzimuthDegrees}`,
    `camera.tiltDegrees = ${viewConfig.cameraTiltDegrees}`,
    `camera.distanceMultiplier = ${viewConfig.cameraDistanceMultiplier}`,
    `camera.targetZMultiplier = ${viewConfig.cameraTargetZMultiplier}`
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

  featureCollection.features.forEach(
    function buildFeature(feature, featureIndex) {
      const polygons = getGeometryPolygons(feature);
      const topFaceColor = new THREE.Color(mapConfig.colors.topFace);
      const sideFaceColor = new THREE.Color(mapConfig.colors.sideFace);
      const featureHeight = mapConfig.map.blockHeight;
      const featureName =
        feature.properties?.name || `区域 ${featureIndex + 1}`;
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
          curveSegments: 2
        });

        /**
         * ExtrudeGeometry 支持多材质：
         * - 第一个材质用于顶面/底面
         * - 第二个材质用于挤出的侧面
         * 这样就能把顶面和侧面拆成两种颜色。
         */
        const topMaterial = new THREE.MeshStandardMaterial({
          color: topFaceColor.clone(),
          emissive: topFaceColor
            .clone()
            .multiplyScalar(mapConfig.lighting.topEmissiveStrength),
          metalness: 0.14,
          roughness: 0.4
        });
        const sideMaterial = new THREE.MeshStandardMaterial({
          color: sideFaceColor.clone(),
          emissive: sideFaceColor
            .clone()
            .multiplyScalar(mapConfig.lighting.sideEmissiveStrength),
          metalness: 0.08,
          roughness: 0.52
        });

        const mesh = new THREE.Mesh(geometry, [topMaterial, sideMaterial]);
        mesh.userData = {
          featureIndex,
          featureName,
          baseTopColor: topFaceColor.clone(),
          baseSideColor: sideFaceColor.clone()
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
        const { labelObject, labelElement: nextLabelElement } =
          createFeatureLabel(featureName, labelAnchorPoint, featureHeight);
        mapGroup.add(labelObject);
        labelElement = nextLabelElement;
      }

      featureEntries.push({
        featureIndex,
        featureName,
        labelAnchorPoint,
        baseTopColor: topFaceColor,
        baseSideColor: sideFaceColor,
        height: featureHeight,
        targetLiftZ: mapConfig.interaction.featureLiftIdleZ,
        meshes,
        outlineMaterials,
        labelElement
      });
    }
  );

  const maxSpan = Math.max(bounds.lonSpan, bounds.latSpan) * scale;

  return {
    bounds,
    mapGroup,
    featureEntries,
    maxSpan,
    scale
  };
}

function getNormalizedBarData(featureEntries, mapDistribution) {
  const baseMarkerZ = mapConfig.map.blockHeight + 2;
  const districtItems = Array.isArray(mapDistribution?.hangzhou_districts)
    ? mapDistribution.hangzhou_districts
    : [];
  const districtItemMap = new Map(
    districtItems.map(function mapDistrictItem(item) {
      return [normalizeDistrictName(item?.name), item];
    })
  );
  return featureEntries.map(function mapFeatureEntry(featureEntry) {
    const matchedDistrictItem = districtItemMap.get(
      normalizeDistrictName(featureEntry.featureName)
    );
    const metricValue = toSafeNumber(
      matchedDistrictItem?.value,
      toSafeNumber(matchedDistrictItem?.height, 0)
    );

    return {
      name: featureEntry.featureName,
      metricValue,
      featureEntry,
      baseMarkerZ
    };
  });
}

function buildBarOverlays(featureEntries, mapDistribution, bounds, scale) {
  const barEntries = [];
  const barGroup = new THREE.Group();
  const normalizedBarData = getNormalizedBarData(
    featureEntries,
    mapDistribution
  );
  const barMetricValues = normalizedBarData.map(function mapBarMetricValue(item) {
    return item.metricValue;
  });
  const maxBarMetricValue = Math.max(...barMetricValues, 1);

  normalizedBarData.forEach(function buildBarEntry(barDatum, barIndex) {
    const { featureEntry, metricValue, baseMarkerZ } = barDatum;
    const projectedAnchorPoint = getProjectedBarAnchorPoint(
      featureEntry,
      bounds,
      scale
    );

    if (!projectedAnchorPoint) {
      return;
    }

    const barHeight = getBarHeight(
      metricValue,
      maxBarMetricValue,
      mapConfig.bar.minHeight,
      mapConfig.bar.maxHeight
    );
    const barStyle = getBarVisualStyle(metricValue);
    const marker = createReactBarMarkerObject({
      x: projectedAnchorPoint.x + mapConfig.bar.offsetX,
      y: projectedAnchorPoint.y,
      z: baseMarkerZ,
      name: barDatum?.name || `点位 ${barIndex + 1}`,
      value: metricValue.toLocaleString("zh-CN"),
      metricValue
    });
    barGroup.add(marker.markerObject);

    barEntries.push({
      barIndex,
      featureIndex: featureEntry.featureIndex,
      name: barDatum?.name || `点位 ${barIndex + 1}`,
      metricValue,
      barHeight,
      baseMarkerZ,
      markerElement: marker.markerElement,
      markerObject: marker.markerObject,
      style: barStyle
    });
  });

  return {
    barEntries,
    barGroup
  };
}

function updateBarOverlays(
  barEntries,
  featureEntries,
  mapDistribution,
  bounds,
  scale
) {
  if (!barEntries.length) {
    return;
  }

  const normalizedBarData = getNormalizedBarData(featureEntries, mapDistribution);
  const barMetricValues = normalizedBarData.map(function mapBarMetricValue(item) {
    return item.metricValue;
  });
  const maxBarMetricValue = Math.max(...barMetricValues, 1);

  normalizedBarData.forEach(function updateBarEntry(barDatum, barIndex) {
    const currentBarEntry = barEntries[barIndex];
    const { featureEntry, metricValue, baseMarkerZ } = barDatum;

    if (!currentBarEntry) {
      return;
    }

    const projectedAnchorPoint = getProjectedBarAnchorPoint(
      featureEntry,
      bounds,
      scale
    );

    if (!projectedAnchorPoint) {
      currentBarEntry.markerElement.style.display = "none";
      return;
    }

    currentBarEntry.markerElement.style.display = "";
    currentBarEntry.name = barDatum?.name || `点位 ${barIndex + 1}`;
    currentBarEntry.metricValue = metricValue;
    currentBarEntry.barHeight = getBarHeight(
      metricValue,
      maxBarMetricValue,
      mapConfig.bar.minHeight,
      mapConfig.bar.maxHeight
    );
    currentBarEntry.baseMarkerZ = baseMarkerZ;

    const updatedMarkerMeta = updateReactBarMarkerObject(
      currentBarEntry.markerObject,
      currentBarEntry.markerElement,
      {
        x: projectedAnchorPoint.x + mapConfig.bar.offsetX,
        y: projectedAnchorPoint.y,
        z: baseMarkerZ,
        name: currentBarEntry.name,
        value: metricValue.toLocaleString("zh-CN"),
        metricValue
      }
    );

    if (updatedMarkerMeta) {
      currentBarEntry.style = updatedMarkerMeta.style;
    }
  });
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
            .lerp(new THREE.Color(mapConfig.colors.hoverBlend), 0.22)
        : mesh.userData.baseTopColor;
      const nextSideColor = isActive
        ? mesh.userData.baseSideColor
            .clone()
            .lerp(new THREE.Color(mapConfig.colors.hoverBlend), 0.18)
        : mesh.userData.baseSideColor;

      mesh.material[0].color.copy(nextTopColor);
      mesh.material[0].emissive.copy(
        isActive
          ? mesh.userData.baseTopColor
              .clone()
              .multiplyScalar(mapConfig.lighting.hoverTopEmissiveStrength)
          : mesh.userData.baseTopColor
              .clone()
              .multiplyScalar(mapConfig.lighting.topEmissiveStrength)
      );

      mesh.material[1].color.copy(nextSideColor);
      mesh.material[1].emissive.copy(
        isActive
          ? mesh.userData.baseSideColor
              .clone()
              .multiplyScalar(mapConfig.lighting.hoverSideEmissiveStrength)
          : mesh.userData.baseSideColor
              .clone()
              .multiplyScalar(mapConfig.lighting.sideEmissiveStrength)
      );
    });
    featureEntry.targetLiftZ = isActive
      ? mapConfig.interaction.featureLiftActiveZ
      : mapConfig.interaction.featureLiftIdleZ;

    featureEntry.outlineMaterials.forEach(
      function updateLineMaterial(material) {
        material.color.set(
          isActive ? "#ffffff" : mapConfig.colors.boundaryLine
        );
        material.opacity = isActive ? 1 : 0.95;
      }
    );

    if (featureEntry.labelElement) {
      featureEntry.labelElement.style.color = "#ffffff";
      featureEntry.labelElement.style.opacity = isActive ? "1" : "0.92";
    }
  });
}

function animateFeatureLift(featureEntries, deltaSeconds) {
  /**
   * 标准做法是：交互层只更新 target，渲染循环里做阻尼插值。
   * 这样动画不会受 pointermove 频率影响，过渡也更稳定。
   */
  featureEntries.forEach(function updateFeatureLift(featureEntry) {
    const targetLiftZ =
      featureEntry.targetLiftZ ?? mapConfig.interaction.featureLiftIdleZ;

    featureEntry.meshes.forEach(function updateMeshLift(mesh) {
      const nextLiftZ = THREE.MathUtils.damp(
        mesh.position.z,
        targetLiftZ,
        mapConfig.interaction.featureLiftDamping,
        deltaSeconds
      );

      mesh.position.z =
        Math.abs(nextLiftZ - targetLiftZ) <
        mapConfig.interaction.featureLiftEpsilon
          ? targetLiftZ
          : nextLiftZ;
    });
  });
}

function syncBarMarkerLift(barEntries, featureEntries) {
  /**
   * 板块 hover 时，点位和板块一起抬起。
   * marker 自己不做独立动画，直接读取所属板块当前的 z 偏移，
   * 这样可以保证点位和板块始终贴在一起，不会出现一边升起一边留在原地。
   */
  const featureLiftMap = new Map(
    featureEntries.map(function mapFeatureLift(featureEntry) {
      return [
        featureEntry.featureIndex,
        featureEntry.meshes[0]?.position.z ??
          mapConfig.interaction.featureLiftIdleZ
      ];
    })
  );

  barEntries.forEach(function updateBarMarkerLift(barEntry) {
    const featureLiftZ =
      featureLiftMap.get(barEntry.featureIndex) ??
      mapConfig.interaction.featureLiftIdleZ;

    barEntry.markerObject.position.z = barEntry.baseMarkerZ + featureLiftZ;
  });
}

function removeBarGroupElements(barGroup) {
  if (!barGroup) {
    return;
  }

  /**
   * barGroup 里挂的是 CSS2DObject。
   * 仅仅 scene.remove(barGroup) 还不够，旧的 DOM marker 可能会残留在
   * CSS2DRenderer 的容器里，表现成“地图拖动后复制出一层悬浮副本”。
   * 这里显式把旧 marker DOM 一起摘掉，避免刷新点位数据后留下幽灵节点。
   */
  barGroup.traverse(function removeBarGroupElement(node) {
    if (
      node.isCSS2DObject &&
      node.element &&
      node.element.parentNode
    ) {
      node.element.remove();
    }
  });
}

function getBarMarkerScale(camera, controls, baseCameraDistance) {
  /**
   * CSS2DObject 默认保持固定屏幕像素，不会随相机远近透视缩放。
   * 这里按相机距离补一个温和缩放，让 marker 和地图本体的比例更一致。
   */
  const currentCameraDistance = camera.position.distanceTo(controls.target);
  const rawScale = Math.pow(
    baseCameraDistance / Math.max(currentCameraDistance, 1),
    mapConfig.bar.markerScalePower
  );

  return THREE.MathUtils.clamp(
    rawScale,
    mapConfig.bar.markerMinScale,
    mapConfig.bar.markerMaxScale
  );
}

function updateBarMarkerScale(barEntries, markerScale) {
  barEntries.forEach(function updateMarkerScale(barEntry) {
    if (
      typeof barEntry.currentMarkerScale === "number" &&
      Math.abs(barEntry.currentMarkerScale - markerScale) <
        mapConfig.bar.markerScaleEpsilon
    ) {
      return;
    }

    barEntry.currentMarkerScale = markerScale;
    barEntry.markerElement.style.setProperty(
      "--map-marker-scale",
      markerScale.toFixed(3)
    );
  });
}

function setBarHighlight(barEntries, activeBarIndex) {
  barEntries.forEach(function updateBarEntry(barEntry) {
    const isActive = barEntry.barIndex === activeBarIndex;
    /**
     * 点位靠得很近时，hover 的那个点需要始终压到最上层，
     * 否则浮层内容很容易被邻近点位盖住。
     */
    barEntry.markerObject.renderOrder = isActive ? 9999 : 20;
    barEntry.markerElement.style.zIndex = isActive ? "9999" : "20";
    barEntry.markerElement.style.opacity = isActive ? "1" : "0.96";
  });
}

function ThreeBlockMap({
  mapDistribution,
  showTopOverlay = true,
  showInfoPanel = true,
  showViewDebugPanel = mapConfig.camera.showViewDebugPanel,
  enableCameraRotate = mapConfig.camera.enableRotate,
  enableCameraPan = mapConfig.camera.enablePan,
  logViewConfigToConsole = mapConfig.camera.logViewConfigToConsole
}) {
  const containerRef = useRef(null);
  const infoRef = useRef(null);
  const tooltipRef = useRef(null);
  const viewDebugRef = useRef(null);
  const mapDistributionRef = useRef(mapDistribution);
  const sceneRuntimeRef = useRef(null);
  const [tooltipData, setTooltipData] = useState({
    visible: false,
    name: "区块名称",
    value: "-",
    metricColor: BAR_NORMAL_STYLE.valueTextColor
  });

  useEffect(
    function initThreeMapEffect() {
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
      const animationTimer = new THREE.Timer();
      animationTimer.connect(document);

      async function initScene() {
        /**
         * 这里直接读取 public 下的静态 GeoJSON。
         * 因为 test 页只是本地实验页，不需要再抽一层数据请求封装。
         */
        const geoJson = await getHangzhouGeoJson();

        if (disposed) {
          return;
        }

        const { bounds, mapGroup, featureEntries, maxSpan, scale } =
          buildDistrictMeshes(geoJson);
        /**
         * 地图整体默认朝向在这里控制。
         * 改角度时优先改配置里的 map.rotationDegrees，不要直接写死弧度值。
         */
        mapGroup.rotation.z = THREE.MathUtils.degToRad(
          mapConfig.map.rotationDegrees
        );
        const meshTargets = [
          ...featureEntries.flatMap(function flattenFeature(feature) {
            return feature.meshes;
          })
        ];

        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#031525");
        scene.fog = new THREE.Fog(
          "#031525",
          maxSpan * mapConfig.lighting.fogStartMultiplier,
          maxSpan * mapConfig.lighting.fogEndMultiplier
        );

        /**
         * 默认展示角度由配置对象里的 camera 字段决定。
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
          alpha: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(
          containerElement.clientWidth,
          containerElement.clientHeight
        );
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = mapConfig.lighting.rendererExposure;
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
         * - 旋转和平移拆成两个独立开关，页面层可以只开其中一种
         * - 当前首页如果只允许平移，就关闭 enableCameraRotate，只开启 enableCameraPan
         * - OrbitControls 默认左键是旋转，所以只开平移时还需要把左键手势改成 PAN
         * - 明确关闭默认自动旋转
         * - 目标点抬高一点，让镜头视线更贴近地图中部
         */
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = enableCameraPan;
        controls.enableRotate = enableCameraRotate;
        if (enableCameraPan && !enableCameraRotate) {
          controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
          controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
          controls.touches.ONE = THREE.TOUCH.PAN;
          controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
        }
        controls.minDistance = maxSpan * 0.45;
        controls.maxDistance = maxSpan * 2;
        controls.minPolarAngle = THREE.MathUtils.degToRad(
          mapConfig.camera.minPolarDegrees
        );
        controls.maxPolarAngle = THREE.MathUtils.degToRad(
          mapConfig.camera.maxPolarDegrees
        );
        controls.target.set(
          0,
          0,
          maxSpan * mapConfig.camera.targetZMultiplier
        );
        controls.autoRotate = false;
        const markerBaseCameraDistance = camera.position.distanceTo(
          controls.target
        );

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
            opacity: 0.55
          })
        );
        plane.position.z = -8;

        scene.add(ambientLight);
        scene.add(directionalLight);
        scene.add(rimLight);
        scene.add(plane);
        scene.add(mapGroup);
        syncViewDebug(false);

        // ===================================


        //  =======================================

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
            nextHoverTarget?.kind === "feature"
              ? nextHoverTarget.index
              : nextHoverTarget?.kind === "bar"
                ? nextHoverTarget.featureIndex
                : null;
          const nextBarIndex =
            nextHoverTarget?.kind === "bar" ? nextHoverTarget.index : null;

          if (
            activeFeatureIndex === nextFeatureIndex &&
            activeBarIndex === nextBarIndex
          ) {
            return;
          }

          const currentBarEntries = sceneRuntimeRef.current?.barEntries || [];
          activeFeatureIndex = nextFeatureIndex;
          activeBarIndex = nextBarIndex;
          setFeatureHighlight(featureEntries, activeFeatureIndex);
          setBarHighlight(currentBarEntries, activeBarIndex);

          if (!infoRef.current) {
            return;
          }

          if (activeBarIndex === null) {
            infoRef.current.textContent = "悬停柱子查看点位详情";
            setTooltipData(function hideTooltip(previousTooltipData) {
              if (!previousTooltipData.visible) {
                return previousTooltipData;
              }

              return {
                ...previousTooltipData,
                visible: false
              };
            });
            return;
          }

          const activeBar =
            activeBarIndex === null
              ? null
              : currentBarEntries.find(function findBarEntry(barEntry) {
                  return barEntry.barIndex === activeBarIndex;
                });

          infoRef.current.textContent = activeBar
            ? `${activeBar.name} · 数值 ${activeBar.metricValue.toLocaleString("zh-CN")}`
            : "悬停柱子查看点位详情";

          if (!activeBar) {
            return;
          }

          setTooltipData({
            visible: true,
            name: activeBar.name,
            value: activeBar.metricValue.toLocaleString("zh-CN"),
            metricColor: activeBar.style.valueTextColor
          });
        }

        function updateTooltipPosition(event) {
          if (!tooltipRef.current) {
            return;
          }

          const containerRect = containerElement.getBoundingClientRect();
          tooltipRef.current.style.left = `${event.clientX - containerRect.left + mapConfig.tooltip.offsetX}px`;
          tooltipRef.current.style.top = `${event.clientY - containerRect.top + mapConfig.tooltip.offsetY}px`;
        }

        function handleBarPointerEnter(barEntry, event) {
          updateHoverState({
            kind: "bar",
            index: barEntry.barIndex,
            featureIndex: barEntry.featureIndex
          });
          updateTooltipPosition(event);
        }

        function handleBarPointerMove(barEntry, event) {
          updateHoverState({
            kind: "bar",
            index: barEntry.barIndex,
            featureIndex: barEntry.featureIndex
          });
          updateTooltipPosition(event);
        }

        function handleBarPointerLeave() {
          updateHoverState(null);
        }

        function cleanupBarPointerEvents() {
          const sceneRuntime = sceneRuntimeRef.current;

          if (!sceneRuntime?.barPointerCleanupTasks?.length) {
            return;
          }

          sceneRuntime.barPointerCleanupTasks
            .splice(0)
            .forEach(function runBarPointerCleanup(cleanupTask) {
              cleanupTask();
            });
        }

        function bindBarPointerEvents(barEntries) {
          const sceneRuntime = sceneRuntimeRef.current;

          if (!sceneRuntime) {
            return;
          }

          barEntries.forEach(function bindBarPointerEventsForEntry(barEntry) {
            const handlePointerEnter = function handlePointerEnter(event) {
              handleBarPointerEnter(barEntry, event);
            };
            const handlePointerMove = function handlePointerMove(event) {
              handleBarPointerMove(barEntry, event);
            };
            const handleWheel = function handleWheel(event) {
              /**
               * 点位 marker 是挂在 CSS2D DOM 层上的。
               * 鼠标滚轮落在 marker 上时，事件不会自然传到底下的 renderer，
               * OrbitControls 就会出现“有时缩放不触发”的感觉。
               * 这里把 wheel 事件透传给 renderer，让缩放在点位区域也保持一致。
               */
              event.preventDefault();
              renderer.domElement.dispatchEvent(
                new WheelEvent("wheel", {
                  deltaX: event.deltaX,
                  deltaY: event.deltaY,
                  deltaZ: event.deltaZ,
                  clientX: event.clientX,
                  clientY: event.clientY,
                  screenX: event.screenX,
                  screenY: event.screenY,
                  ctrlKey: event.ctrlKey,
                  shiftKey: event.shiftKey,
                  altKey: event.altKey,
                  metaKey: event.metaKey,
                  bubbles: true,
                  cancelable: true
                })
              );
            };

            barEntry.markerElement.addEventListener(
              "pointerenter",
              handlePointerEnter
            );
            barEntry.markerElement.addEventListener(
              "pointermove",
              handlePointerMove
            );
            barEntry.markerElement.addEventListener(
              "pointerleave",
              handleBarPointerLeave
            );
            barEntry.markerElement.addEventListener("wheel", handleWheel, {
              passive: false
            });

            sceneRuntime.barPointerCleanupTasks.push(
              function cleanupBarPointerEventsForEntry() {
                barEntry.markerElement.removeEventListener(
                  "pointerenter",
                  handlePointerEnter
                );
                barEntry.markerElement.removeEventListener(
                  "pointermove",
                  handlePointerMove
                );
                barEntry.markerElement.removeEventListener(
                  "pointerleave",
                  handleBarPointerLeave
                );
                barEntry.markerElement.removeEventListener(
                  "wheel",
                  handleWheel
                );
              }
            );
          });
        }

        function replaceBarOverlays(nextMapDistribution) {
          const sceneRuntime = sceneRuntimeRef.current;

          if (!sceneRuntime) {
            return;
          }

          cleanupBarPointerEvents();

          if (sceneRuntime.barGroup && sceneRuntime.barEntries.length > 0) {
            updateBarOverlays(
              sceneRuntime.barEntries,
              featureEntries,
              nextMapDistribution,
              bounds,
              scale
            );
            bindBarPointerEvents(sceneRuntime.barEntries);
          } else {
            if (sceneRuntime.barGroup) {
              removeBarGroupElements(sceneRuntime.barGroup);
              scene.remove(sceneRuntime.barGroup);
            }

            const { barEntries, barGroup } = buildBarOverlays(
              featureEntries,
              nextMapDistribution,
              bounds,
              scale
            );
            barGroup.rotation.z = THREE.MathUtils.degToRad(
              mapConfig.map.rotationDegrees
            );
            scene.add(barGroup);

            sceneRuntime.barEntries = barEntries;
            sceneRuntime.barGroup = barGroup;
            bindBarPointerEvents(barEntries);
          }

          if (activeBarIndex !== null) {
            const activeBarStillExists = sceneRuntime.barEntries.some(
              function hasActiveBar(barEntry) {
                return barEntry.barIndex === activeBarIndex;
              }
            );

            if (!activeBarStillExists) {
              activeBarIndex = null;
            }
          }

          setBarHighlight(sceneRuntime.barEntries, activeBarIndex);
        }

        sceneRuntimeRef.current = {
          featureEntries,
          barEntries: [],
          barGroup: null,
          barPointerCleanupTasks: [],
          replaceBarOverlays
        };
        replaceBarOverlays(mapDistributionRef.current);
        cleanupTasks.push(cleanupBarPointerEvents);

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
            intersectionObject
              ? {
                  kind: "feature",
                  index: intersectionObject.userData.featureIndex
                }
              : null;

          updateHoverState(nextHoverTarget);
        }

        function handlePointerLeave(event) {
          /**
           * 鼠标从 WebGL 画布移动到 CSS2D 点位元素时，renderer 会先收到 pointerleave。
           * 这里不要立刻清空 hover，而是允许点位元素接管状态，
           * 避免出现“板块先降下去，移到点位上又重新升起”的闪烁。
           */
          if (
            event?.relatedTarget instanceof Node &&
            labelRenderer.domElement.contains(event.relatedTarget)
          ) {
            return;
          }

          updateHoverState(null);
        }

        function handleMapClick(event) {
          if (!mapConfig.interaction.enableMapClickLog) {
            return;
          }

          const rect = renderer.domElement.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(pointer, camera);
          const intersections = raycaster.intersectObjects(meshTargets, false);
          const clickedMesh = intersections[0]?.object;

          if (!clickedMesh) {
            return;
          }

          const localPoint = mapGroup.worldToLocal(
            intersections[0].point.clone()
          );
          const coordinate = restoreCoordinate(localPoint, bounds.center, scale);

          console.info("[MapClickPosition]", {
            featureName: clickedMesh.userData.featureName || "-",
            coordinate,
            projectedPosition: {
              x: Number(localPoint.x.toFixed(2)),
              y: Number(localPoint.y.toFixed(2))
            },
            barDatumDraft: {
              name: clickedMesh.userData.featureName || "自定义点位",
              value: 1000,
              coordinate
            }
          });
        }

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(containerElement);
        cleanupTasks.push(function cleanupResizeObserver() {
          resizeObserver.disconnect();
        });

        renderer.domElement.addEventListener("pointermove", handlePointerMove);
        renderer.domElement.addEventListener(
          "pointerleave",
          handlePointerLeave
        );
        renderer.domElement.addEventListener("click", handleMapClick);
        cleanupTasks.push(function cleanupPointerEvents() {
          renderer.domElement.removeEventListener(
            "pointermove",
            handlePointerMove
          );
          renderer.domElement.removeEventListener(
            "pointerleave",
            handlePointerLeave
          );
          renderer.domElement.removeEventListener("click", handleMapClick);
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

        function renderFrame(timestamp) {
          /**
           * 每一帧做四件事：
           * 1. 更新板块抬起动画
           * 2. 更新 controls 的阻尼过渡
           * 3. 根据相机距离同步 marker 缩放
           * 4. 渲染场景
           */
          if (disposed) {
            return;
          }

          animationFrameId = window.requestAnimationFrame(renderFrame);
          animationTimer.update(timestamp);
          animateFeatureLift(featureEntries, animationTimer.getDelta());
          syncBarMarkerLift(sceneRuntimeRef.current?.barEntries || [], featureEntries);
          controls.update();
          updateBarMarkerScale(
            sceneRuntimeRef.current?.barEntries || [],
            getBarMarkerScale(camera, controls, markerBaseCameraDistance)
          );
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
          animationTimer.dispose();
          controls.dispose();
          removeBarGroupElements(sceneRuntimeRef.current?.barGroup);

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
        sceneRuntimeRef.current = null;
        cleanupTasks.reverse().forEach(function runCleanup(cleanupTask) {
          cleanupTask();
        });
      };
    },
    [
      enableCameraPan,
      enableCameraRotate,
      logViewConfigToConsole,
      showViewDebugPanel
    ]
  );

  useEffect(
    function syncMapDistributionEffect() {
      mapDistributionRef.current = mapDistribution;

      if (!sceneRuntimeRef.current?.replaceBarOverlays) {
        return;
      }

      sceneRuntimeRef.current.replaceBarOverlays(mapDistribution);
    },
    [mapDistribution]
  );

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
      <MapDetailTooltipCard
        containerRef={tooltipRef}
        name={tooltipData.name}
        value={tooltipData.value}
        metricColor={tooltipData.metricColor}
        className={`pointer-events-none absolute left-0 top-0 z-[100000] transition-opacity ${tooltipData.visible ? "opacity-100" : "opacity-0"}`}
      />
      {showViewDebugPanel ? (
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-[340px] rounded-2xl border border-cyan-400/20 bg-slate-950/60 px-4 py-3 backdrop-blur">
          <p className="text-[11px] tracking-[0.24em] text-cyan-300/72">
            VIEW CONFIG
          </p>
          <pre
            ref={viewDebugRef}
            className="mt-2 whitespace-pre-wrap text-xs leading-5 text-cyan-50">
            map.rotationDegrees = {mapConfig.map.rotationDegrees}
            {"\n"}
            camera.azimuthDegrees = {mapConfig.camera.azimuthDegrees}
            {"\n"}
            camera.tiltDegrees = {mapConfig.camera.tiltDegrees}
            {"\n"}
            camera.distanceMultiplier = {mapConfig.camera.distanceMultiplier}
            {"\n"}
            camera.targetZMultiplier = {mapConfig.camera.targetZMultiplier}
          </pre>
        </div>
      ) : null}
    </section>
  );
}

export default ThreeBlockMap;
