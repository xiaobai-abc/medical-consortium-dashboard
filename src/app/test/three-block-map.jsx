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
  getBarVisualStyle
} from "../ui/middle/map/components/react-bar-marker";

const BLOCK_HEIGHT = 32;
const MAP_SCALE = 900;
const FLOOR_COLOR = "#071321";
const MAP_TOP_COLOR = "#2F7BFF";
const MAP_SIDE_COLOR = "#0D2A5C";
const MAP_LINE_COLOR = "#7DDFFF";
const BAR_COLOR = 0x00e5ff;
const BAR_MAX_HEIGHT = 128;
const BAR_MIN_HEIGHT = 72;
const MAP_ROTATION_DEGREES = 30;
const CAMERA_AZIMUTH_DEGREES = -113.72;
const CAMERA_TILT_DEGREES = 68.25;
const CAMERA_DISTANCE_MULTIPLIER = 1.387;
const CAMERA_TARGET_Z_MULTIPLIER = 0.08;
const CAMERA_MIN_POLAR_DEGREES = 20;
const CAMERA_MAX_POLAR_DEGREES = 82;
const SIMPLE_BAR_POSITION = {
  x: -110,
  y: 112,
  value: 1280
};
const HOME_STYLE_BAR_POSITION = {
  x: 110,
  y: 88,
  value: 1280,
  name: "首页同款"
};
const SIMPLE_BAR_DOT_RADIUS = 7;
const SIMPLE_BAR_LENGTH = 26;
const SIMPLE_BAR_DEPTH = 7;
const HOME_BAR_WIDTH = 12;
const HOME_BAR_DOT_RADIUS = 10;
const HOME_BAR_LABEL_OFFSET_Y = 18;
const HOME_BAR_LABEL_OFFSET_Z = -18;
const HOME_BAR_EMISSIVE_STRENGTH = 0.8;
const HOME_BAR_DOT_EMISSIVE_STRENGTH = 0.52;
const TOOLTIP_OFFSET_X = 18;
const TOOLTIP_OFFSET_Y = 18;

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
  return new THREE.Vector2(
    (point[0] - center[0]) * scale,
    (point[1] - center[1]) * -scale
  );
}

function normalizeRing(ring, center, scale, shouldBeClockwise) {
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
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  featureCollection.features.forEach(function walkFeature(feature) {
    getGeometryPolygons(feature).forEach(function walkPolygon(polygon) {
      polygon.forEach(function walkRing(ring) {
        ring.forEach(function walkCoordinate(coordinate) {
          minLon = Math.min(minLon, coordinate[0]);
          maxLon = Math.max(maxLon, coordinate[0]);
          minLat = Math.min(minLat, coordinate[1]);
          maxLat = Math.max(maxLat, coordinate[1]);
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

function createRingLine(outerRing, blockHeight) {
  const linePoints = outerRing.map(function mapPoint(point) {
    return new THREE.Vector3(point.x, point.y, blockHeight + 0.6);
  });

  if (linePoints.length > 0) {
    linePoints.push(linePoints[0].clone());
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: MAP_LINE_COLOR,
    transparent: true,
    opacity: 0.85
  });

  return new THREE.Line(lineGeometry, lineMaterial);
}

function buildDistrictMeshes(featureCollection) {
  const bounds = collectBounds(featureCollection);
  const dominantSpan = Math.max(bounds.lonSpan, bounds.latSpan);
  const scale = dominantSpan === 0 ? 1 : MAP_SCALE / dominantSpan;
  const mapGroup = new THREE.Group();

  featureCollection.features.forEach(function buildFeature(feature) {
    const polygons = getGeometryPolygons(feature);

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

        shape.holes.push(new THREE.Path(normalizedHole));
      });

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: BLOCK_HEIGHT,
        bevelEnabled: false,
        curveSegments: 2
      });

      const topMaterial = new THREE.MeshStandardMaterial({
        color: MAP_TOP_COLOR,
        emissive: new THREE.Color(MAP_TOP_COLOR).multiplyScalar(0.28),
        metalness: 0.08,
        roughness: 0.42
      });
      const sideMaterial = new THREE.MeshStandardMaterial({
        color: MAP_SIDE_COLOR,
        emissive: new THREE.Color(MAP_SIDE_COLOR).multiplyScalar(0.18),
        metalness: 0.06,
        roughness: 0.56
      });

      const mesh = new THREE.Mesh(geometry, [topMaterial, sideMaterial]);
      mapGroup.add(mesh);
      mapGroup.add(createRingLine(outerRing, BLOCK_HEIGHT));
    });
  });

  return {
    mapGroup,
    maxSpan: dominantSpan * scale
  };
}

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

function createReactMarker({
  x = 0,
  y = 0,
  height = BAR_MIN_HEIGHT,
  name = "测试标记",
  value = "1280"
}) {
  const marker = createReactBarMarkerObject({
    x,
    y,
    z: BLOCK_HEIGHT + 2,
    name,
    value,
    metricValue: Number(value) || 0
  });

  return {
    markerObject: marker.markerObject,
    markerElement: marker.markerElement,
    style: marker.style,
    setHovered() {},
    cleanup() {}
  };
}

function createHomeBarLabel(metricValue, name, style) {
  const wrapperElement = document.createElement("div");
  wrapperElement.style.display = "flex";
  wrapperElement.style.flexDirection = "column";
  wrapperElement.style.alignItems = "center";
  wrapperElement.style.gap = "8px";
  wrapperElement.style.pointerEvents = "none";
  wrapperElement.style.transform = "translate(-50%, 0%)";

  const valueElement = document.createElement("div");
  valueElement.textContent = metricValue.toLocaleString("zh-CN");
  valueElement.style.minWidth = "44px";
  valueElement.style.padding = "3px 9px";
  valueElement.style.border = `1px solid ${style.valueBorderColor}`;
  valueElement.style.borderRadius = "5px";
  valueElement.style.background = style.valueBackground;
  valueElement.style.boxShadow = `0 0 18px ${style.glowColor}`;
  valueElement.style.color = style.valueTextColor;
  valueElement.style.fontSize = "12px";
  valueElement.style.fontWeight = "700";
  valueElement.style.lineHeight = "1";
  valueElement.style.textAlign = "center";
  valueElement.style.fontVariantNumeric = "tabular-nums";
  valueElement.style.letterSpacing = "0.04em";
  valueElement.style.whiteSpace = "nowrap";

  const nameElement = document.createElement("div");
  nameElement.textContent = name;
  nameElement.style.padding = "4px 14px";
  nameElement.style.border = `1px solid ${style.nameBorderColor}`;
  nameElement.style.borderRadius = "999px";
  nameElement.style.background = style.nameBackground;
  nameElement.style.boxShadow = `0 0 20px ${style.glowColor}`;
  nameElement.style.color = style.nameTextColor;
  nameElement.style.fontSize = "11px";
  nameElement.style.fontWeight = "500";
  nameElement.style.lineHeight = "1";
  nameElement.style.letterSpacing = "0.02em";
  nameElement.style.whiteSpace = "nowrap";

  wrapperElement.appendChild(valueElement);
  wrapperElement.appendChild(nameElement);

  return new CSS2DObject(wrapperElement);
}

function createBillboardBar(width, height, color, glowColor) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.96
    })
  );
}

function createHomeStyleBar({
  x = 0,
  y = 0,
  height = BAR_MIN_HEIGHT,
  value = 1280,
  name = "首页同款",
  style = getBarVisualStyle(value)
}) {
  const group = new THREE.Group();
  const barColor = new THREE.Color(style.barColor);

  /**
   * 右侧这根柱子用于验证“更像二维”的方向：
   * - 保留首页同款底部圆点和 label
   * - 柱体本身改成窄平面
   * - 后面在渲染循环里让它始终朝向相机
   */
  const circle = new THREE.Mesh(
    new THREE.CylinderGeometry(
      HOME_BAR_DOT_RADIUS,
      HOME_BAR_DOT_RADIUS,
      2.4,
      24
    ),
    new THREE.MeshStandardMaterial({
      color: barColor,
      emissive: barColor.clone().multiplyScalar(HOME_BAR_DOT_EMISSIVE_STRENGTH),
      metalness: 0.08,
      roughness: 0.28
    })
  );
  circle.rotation.x = Math.PI / 2;
  circle.position.z = 1.2;
  group.add(circle);

  const bar = createBillboardBar(
    HOME_BAR_WIDTH,
    height,
    barColor,
    style.glowColor
  );
  bar.position.z = height / 2;
  group.add(bar);

  const label = createHomeBarLabel(value, name, style);
  label.position.set(
    0,
    HOME_BAR_LABEL_OFFSET_Y,
    8
  );
  group.add(label);

  group.position.set(x, y, BLOCK_HEIGHT);

  return group;
}

export default function ThreeBlockMap() {
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [tooltipData, setTooltipData] = useState({
    visible: false,
    name: "测试标记",
    value: "1280",
    metricColor: BAR_NORMAL_STYLE.valueTextColor
  });

  useEffect(function initTestThreeMapEffect() {
    const containerElement = containerRef.current;

    if (!containerElement) {
      return;
    }

    let animationFrameId = 0;
    let disposed = false;
    let simpleMarkerHovered = false;
    const cleanupTasks = [];
    async function initScene() {
      const response = await fetch("/json/330100.geojson");
      const geoJson = await response.json();

      if (disposed) {
        return;
      }

      const { mapGroup, maxSpan } = buildDistrictMeshes(geoJson);
      const barGroup = new THREE.Group();
      mapGroup.rotation.z = THREE.MathUtils.degToRad(MAP_ROTATION_DEGREES);
      barGroup.rotation.z = THREE.MathUtils.degToRad(MAP_ROTATION_DEGREES);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#031525");
      const fullBillboardMeshes = [];
      const camera = new THREE.PerspectiveCamera(
        42,
        containerElement.clientWidth / containerElement.clientHeight,
        1,
        5000
      );
      camera.up.set(0, 0, 1);
      camera.position.copy(getDefaultCameraPosition(maxSpan));

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
      containerElement.appendChild(renderer.domElement);

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

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.minPolarAngle = THREE.MathUtils.degToRad(
        CAMERA_MIN_POLAR_DEGREES
      );
      controls.maxPolarAngle = THREE.MathUtils.degToRad(
        CAMERA_MAX_POLAR_DEGREES
      );
      controls.target.set(0, 0, maxSpan * CAMERA_TARGET_Z_MULTIPLIER);
      controls.minDistance = maxSpan * 0.45;
      controls.maxDistance = maxSpan * 2.2;

      const ambientLight = new THREE.AmbientLight("#b5deff", 1.8);
      const directionalLight = new THREE.DirectionalLight("#ffffff", 1.5);
      directionalLight.position.set(maxSpan * 0.35, maxSpan, maxSpan * 0.42);
      const rimLight = new THREE.DirectionalLight("#00d8ff", 0.7);
      rimLight.position.set(-maxSpan * 0.45, maxSpan * 0.4, -maxSpan * 0.32);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(maxSpan * 1.9, maxSpan * 1.9),
        new THREE.MeshBasicMaterial({
          color: FLOOR_COLOR,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide
        })
      );
      floor.position.z = -8;

      scene.add(ambientLight);
      scene.add(directionalLight);
      scene.add(rimLight);
      scene.add(floor);
      scene.add(mapGroup);
      const maxMarkerMetricValue = Math.max(
        Number(SIMPLE_BAR_POSITION.value) || 0,
        Number(HOME_STYLE_BAR_POSITION.value) || 0,
        1
      );
      const simpleMarker = createReactMarker({
        x: SIMPLE_BAR_POSITION.x,
        y: SIMPLE_BAR_POSITION.y,
        height: getBarHeight(
          Number(SIMPLE_BAR_POSITION.value) || 0,
          maxMarkerMetricValue,
          BAR_MIN_HEIGHT,
          BAR_MAX_HEIGHT
        ),
        name: "React 标记",
        value: String(SIMPLE_BAR_POSITION.value)
      });
      barGroup.add(simpleMarker.markerObject);
      cleanupTasks.push(function cleanupSimpleMarker() {
        simpleMarker.cleanup();
      });

      const homeStyleBar = createHomeStyleBar({
        x: HOME_STYLE_BAR_POSITION.x,
        y: HOME_STYLE_BAR_POSITION.y,
        height: getBarHeight(
          Number(HOME_STYLE_BAR_POSITION.value) || 0,
          maxMarkerMetricValue,
          BAR_MIN_HEIGHT,
          BAR_MAX_HEIGHT
        ),
        value: HOME_STYLE_BAR_POSITION.value,
        name: HOME_STYLE_BAR_POSITION.name
      });
      fullBillboardMeshes.push(homeStyleBar.children[1]);
      barGroup.add(homeStyleBar);
      scene.add(barGroup);

      function handleResize() {
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

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerElement);
      cleanupTasks.push(function cleanupResizeObserver() {
        resizeObserver.disconnect();
      });

      function updateSimpleMarkerHover(nextHovered) {
        if (simpleMarkerHovered === nextHovered) {
          return;
        }

        simpleMarkerHovered = nextHovered;
        simpleMarker.setHovered(nextHovered);
        setTooltipData(function updateTooltip(previousTooltipData) {
          if (nextHovered) {
            return {
              visible: true,
              name: "React 标记",
              value: "1280",
              metricColor: simpleMarker.style.valueTextColor
            };
          }

          return {
            ...previousTooltipData,
            visible: false
          };
        });
      }

      function updateTooltipPosition(event) {
        if (!tooltipRef.current) {
          return;
        }

        const containerRect = containerElement.getBoundingClientRect();
        tooltipRef.current.style.left = `${event.clientX - containerRect.left + TOOLTIP_OFFSET_X}px`;
        tooltipRef.current.style.top = `${event.clientY - containerRect.top + TOOLTIP_OFFSET_Y}px`;
      }

      function handleSimpleMarkerPointerEnter(event) {
        updateSimpleMarkerHover(true);
        updateTooltipPosition(event);
      }

      function handleSimpleMarkerPointerMove(event) {
        updateTooltipPosition(event);
      }

      function handleSimpleMarkerPointerLeave() {
        updateSimpleMarkerHover(false);
      }

      simpleMarker.markerElement.addEventListener(
        "pointerenter",
        handleSimpleMarkerPointerEnter
      );
      simpleMarker.markerElement.addEventListener(
        "pointermove",
        handleSimpleMarkerPointerMove
      );
      simpleMarker.markerElement.addEventListener(
        "pointerleave",
        handleSimpleMarkerPointerLeave
      );
      cleanupTasks.push(function cleanupSimpleMarkerPointerEvents() {
        simpleMarker.markerElement.removeEventListener(
          "pointerenter",
          handleSimpleMarkerPointerEnter
        );
        simpleMarker.markerElement.removeEventListener(
          "pointermove",
          handleSimpleMarkerPointerMove
        );
        simpleMarker.markerElement.removeEventListener(
          "pointerleave",
          handleSimpleMarkerPointerLeave
        );
      });

      function renderFrame() {
        if (disposed) {
          return;
        }

        animationFrameId = window.requestAnimationFrame(renderFrame);
        controls.update();
        fullBillboardMeshes.forEach(function updateBillboard(mesh) {
          mesh.lookAt(camera.position);
        });
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
      }

      renderFrame();

      cleanupTasks.push(function cleanupThreeResources() {
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
      console.error("Init test three map failed", error);
    });

    return function cleanupTestThreeMapEffect() {
      disposed = true;
      cleanupTasks.reverse().forEach(function runCleanup(cleanupTask) {
        cleanupTask();
      });
    };
  }, []);

  return (
    <section className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full rounded-3xl" />
      <MapDetailTooltipCard
        containerRef={tooltipRef}
        name={tooltipData.name}
        value={tooltipData.value}
        metricColor={tooltipData.metricColor}
        className={`pointer-events-none absolute left-0 top-0 z-20 transition-opacity ${
          tooltipData.visible ? "opacity-100" : "opacity-0"
        }`}
      />
    </section>
  );
}
