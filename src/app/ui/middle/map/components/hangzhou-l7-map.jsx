"use client";

import { useEffect, useRef } from "react";

/**
 * 杭州地图组件单独承载 L7 场景和图层逻辑，外部只需要传入整理后的地图数据。
 */
function HangzhouL7Map({ mapData }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(function createMapSceneEffect() {
    let isDisposed = false;

    /**
     * 初始化地图场景，并按顺序挂载板块面、边界线和文字图层。
     */
    async function setupMapScene() {
      const containerElement = containerRef.current;

      if (!containerElement) {
        return;
      }

      setMapContainerOpacity(containerElement, "0");
      destroyMapScene(sceneRef.current);
      sceneRef.current = null;
      clearMapContainer(containerElement);

      const [{ LineLayer, PointLayer, PolygonLayer, Scene }, { Map: L7Map }] =
        await Promise.all([import("@antv/l7"), import("@antv/l7-maps")]);

      if (isDisposed || !containerRef.current) {
        return;
      }

      const nextSceneInstance = new Scene({
        id: containerElement,
        logoVisible: false,
        map: new L7Map({
          bounds: mapData.viewState.bounds,
          fitBoundsOptions: {
            padding: 56
          },
          zoom: mapData.viewState.zoom,
          pitch: 10,
          rotation: -18,
          maxPitch: 76,
          dragRotate: true,
          touchZoomRotate: true,
          doubleClickZoom: true,
          keyboard: false
        })
      });

      sceneRef.current = nextSceneInstance;

      nextSceneInstance.on("loaded", function handleSceneLoaded() {
        if (isDisposed || sceneRef.current !== nextSceneInstance) {
          return;
        }

        createMapLayerList(
          {
            LineLayer,
            PointLayer,
            PolygonLayer
          },
          mapData
        ).forEach(function addMapLayer(layer) {
          nextSceneInstance.addLayer(layer);
        });

        if (containerRef.current === containerElement) {
          setMapContainerOpacity(containerElement, "1");
        }
      });
    }

    setupMapScene().catch(function handleSceneError(error) {
      console.error("L7 scene init failed", error);
    });

    return function cleanupMapScene() {
      isDisposed = true;

      if (sceneRef.current) {
        destroyMapScene(sceneRef.current);
        sceneRef.current = null;
      }

      if (containerRef.current) {
        setMapContainerOpacity(containerRef.current, "");
        clearMapContainer(containerRef.current);
      }
    };
  }, [mapData]);

  return (
    <div className="relative flex-1 h-0 overflow-hidden rounded-[20px] border border-[#1D3B7A]/55 bg-[#081225]">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_56%,rgba(0,231,255,0.16),transparent_40%),linear-gradient(180deg,rgba(9,20,45,0.22)_0%,rgba(5,11,25,0.88)_100%)]" />
      <div className="pointer-events-none absolute left-5 top-4 z-10">
        <div className="inline-flex rounded-full border border-[#1D3B7A]/70 bg-[#091631]/78 px-3 py-1 text-xs text-[#E8F0FF]/90 shadow-[0_0_18px_rgba(0,231,255,0.08)]">
          杭州市 3D 区块地图
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative z-[1] h-full w-full transition-opacity duration-150"
      />
    </div>
  );
}

export default HangzhouL7Map;

/**
 * 销毁旧场景实例，避免开发态热更新时残留旧的 WebGL 资源。
 */
function destroyMapScene(sceneInstance) {
  if (!sceneInstance) {
    return;
  }

  sceneInstance.destroy();
}

/**
 * 清空地图挂载容器，确保下一次初始化从干净的 DOM 开始。
 */
function clearMapContainer(containerElement) {
  containerElement.innerHTML = "";
}

/**
 * 控制地图容器显隐，避免热更新重建场景时出现旧帧闪现。
 */
function setMapContainerOpacity(containerElement, opacityValue) {
  containerElement.style.opacity = opacityValue;
}

/**
 * 统一创建地图图层列表，保持地图逻辑集中在同一个组件文件里。
 */
function createMapLayerList({ LineLayer, PointLayer, PolygonLayer }, mapData) {
  return [
    createFloatLayer(PolygonLayer, mapData.polygonGeoJson),
    createGlowBoundaryLayer(LineLayer, mapData.polygonGeoJson),
    createBorderLayer(LineLayer, mapData.polygonGeoJson),
    createLabelLayer(PointLayer, mapData.labelGeoJson)
  ];
}

/**
 * 浮板层负责渲染主要的 3D 区块。
 */
function createFloatLayer(PolygonLayer, polygonGeoJson) {
  return new PolygonLayer({
    zIndex: 4,
    autoFit: false,
    pickable: true
  })
    .source(polygonGeoJson, {
      parser: {
        type: "geojson"
      }
    })
    .shape("extrude")
    .size("floatElevation")
    .color("fillColor", function mapFillColor(fillColor) {
      return fillColor;
    })
    .active({
      color: "#FFE36A",
      mix: 0.3
    })
    .style({
      opacity: 0.82,
      pickLight: true,
      heightfixed: true,
      raisingHeight: 8,
      topsurface: true,
      sidesurface: true,
      sourceColor: "#1A5FD0",
      targetColor: "#071A37"
    });
}

/**
 * 发光描边层负责给板块补一层柔和外发光。
 */
function createGlowBoundaryLayer(LineLayer, polygonGeoJson) {
  return new LineLayer({
    zIndex: 5,
    autoFit: false,
    pickable: false
  })
    .source(polygonGeoJson, {
      parser: {
        type: "geojson"
      }
    })
    .shape("line")
    .size(2.6)
    .color("#62E9FF")
    .style({
      opacity: 0.42
    });
}

/**
 * 主描边层负责强化区块轮廓。
 */
function createBorderLayer(LineLayer, polygonGeoJson) {
  return new LineLayer({
    zIndex: 6,
    autoFit: false
  })
    .source(polygonGeoJson, {
      parser: {
        type: "geojson"
      }
    })
    .shape("line")
    .size(1.6)
    .color("borderColor", function mapBorderColor(borderColor) {
      return borderColor;
    })
    .style({
      opacity: 1
    });
}

/**
 * 标签层直接使用 L7 原生文字点图层，不额外维护 DOM 浮层。
 */
function createLabelLayer(PointLayer, labelGeoJson) {
  return new PointLayer({
    zIndex: 7,
    autoFit: false,
    pickable: false
  })
    .source(labelGeoJson, {
      parser: {
        type: "geojson"
      }
    })
    .shape("name", "text")
    .size(12)
    .color("labelColor", function mapLabelColor(labelColor) {
      return labelColor;
    })
    .style({
      raisingHeight: 198,
      heightfixed: true,
      textAllowOverlap: false,
      textAnchor: "center",
      textOffset: [0, 0],
      padding: [8, 4],
      fontWeight: "700",
      fontFamily: "sans-serif",
      stroke: "#0B2B4A",
      strokeWidth: 0.5,
      strokeOpacity: 1
    });
}
