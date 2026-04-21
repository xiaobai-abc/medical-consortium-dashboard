"use client";

import { useEffect, useRef } from "react";
import { createMapBarLayer } from "../lib/create-map-bar-layer";

/**
 * 杭州地图组件单独承载 L7 场景和图层逻辑，外部只需要传入整理后的地图数据。
 */
function HangzhouL7Map({ mapData }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  /**
   * 监听地图数据变化并重建整张 L7 场景。
   * 这里不做增量更新，而是销毁旧场景后重新初始化，避免热更新和图层残留问题。
   */
  useEffect(
    function createMapSceneEffect() {
      let isDisposed = false;

      /**
       * 初始化地图场景，并按顺序挂载板块面、边界线和文字图层。
       */
      async function setupMapScene() {
        const containerElement = containerRef.current;

        if (!containerElement) {
          return;
        }

        /**
         * 先把容器隐藏，避免场景重建过程中出现旧帧闪现。
         */
        setMapContainerOpacity(containerElement, "0");
        /**
         * 每次初始化前先销毁旧场景，确保不会把旧的 WebGL 资源留在页面上。
         */
        destroyMapScene(sceneRef.current);
        sceneRef.current = null;
        /**
         * 清空容器 DOM，保证新的 Scene 在干净节点上挂载。
         */
        clearMapContainer(containerElement);

        /**
         * 动态加载 L7 运行时和地图适配器，避免在服务端直接执行浏览器依赖。
         */
        const [{ LineLayer, PointLayer, PolygonLayer, Scene }, { Map: L7Map }] =
          await Promise.all([import("@antv/l7"), import("@antv/l7-maps")]);

        if (isDisposed || !containerRef.current) {
          return;
        }

        /**
         * 创建新的 Scene 和底层地图实例。
         * 当前使用的是 L7 自带 Map 适配器，不依赖外部在线底图接口。
         */
        const nextSceneInstance = new Scene({
          id: containerElement,
          logoVisible: false,
          map: new L7Map({
            bounds: mapData.viewState.bounds,
            fitBoundsOptions: {
              padding: 56
            },
            zoom: mapData.viewState.zoom,
            pitch: 20,
            rotation: -18,
            maxPitch: 76,
            dragRotate: true,
            touchZoomRotate: true,
            doubleClickZoom: true,
            keyboard: false
          })
        });

        sceneRef.current = nextSceneInstance;

        /**
         * 等场景真正 loaded 之后，再批量挂载地图图层。
         * 这里统一走 createMapLayerList，保证图层顺序固定可控。
         */
        nextSceneInstance.on("loaded", function handleSceneLoaded() {
          if (isDisposed || sceneRef.current !== nextSceneInstance) {
            return;
          }

          /**
           * 先创建图层列表，再逐层 add 到场景中。
           * 这样做比零散 addLayer 更容易维护图层叠放关系。
           */
          createMapLayerList(
            {
              LineLayer,
              PointLayer,
              PolygonLayer
            },
            mapData
          ).forEach(function addMapLayer(layer) {
            /**
             * 把当前图层挂进场景，让它参与后续渲染。
             */
            nextSceneInstance.addLayer(layer);
          });

          if (containerRef.current === containerElement) {
            /**
             * 所有图层挂载完成后再显示容器，避免初始化过程被用户看到。
             */
            setMapContainerOpacity(containerElement, "1");
          }
        });
      }

      /**
       * 执行场景初始化；如果初始化失败，把错误打到控制台便于排查。
       */
      setupMapScene().catch(function handleSceneError(error) {
        console.error("L7 scene init failed", error);
      });

      /**
       * 组件卸载或依赖变化时，销毁当前场景并清理容器。
       */
      return function cleanupMapScene() {
        isDisposed = true;

        if (sceneRef.current) {
          /**
           * 清理已经创建的 Scene，释放图层和 WebGL 资源。
           */
          destroyMapScene(sceneRef.current);
          sceneRef.current = null;
        }

        if (containerRef.current) {
          /**
           * 恢复容器透明度，避免下次挂载沿用旧样式。
           */
          setMapContainerOpacity(containerRef.current, "");
          /**
           * 把容器里的旧节点清空，避免热更新后重复叠加。
           */
          clearMapContainer(containerRef.current);
        }
      };
    },
    [mapData]
  );

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
    /**
     * 先渲染区县 3D 板块底座。
     */
    createFloatLayer(PolygonLayer, PointLayer, mapData.polygonGeoJson),
    /**
     * 再渲染发光边，用来增强板块轮廓。
     */
    // createGlowBoundaryLayer(LineLayer, mapData.polygonGeoJson),
    /**
     * 主描边层放在发光边之上，保证轮廓更清晰。
     */
    // createBorderLayer(LineLayer, mapData.polygonGeoJson),
    /**
     * 柱状条层放在板块和描边之上，负责展示区县数值高度。
     */
    // createMapBarLayer(PointLayer, mapData.barGeoJson),
    /**
     * 最后渲染文字标签，避免文字被柱子和描边遮住。
     */
    createLabelLayer(PointLayer, mapData.labelGeoJson)
  ];
}

/**
 * 浮板层负责渲染主要的 3D 区块。
 */
function createFloatLayer(PolygonLayer, PointLayer, polygonGeoJson) {
  // return new PointLayer({
  //   zIndex: 2
  // })
  //   .source(polygonGeoJson)
  //   .shape("cylinder")
  //   .color("#ff0000");
    const polygon3DLayer = new PolygonLayer({
          autoFit: true,
          zIndex: 3
        })
          .source(polygonGeoJson)
          .shape("extrude")
          .color("#528192")
          .size(1)
          .style({
            opacity: 1
          });
          return polygon3DLayer

  /**
   * 新建区块面图层实例，作为地图的主体板块层。
   */
  return (
    new PolygonLayer({
      zIndex: 4,
      autoFit: false,
      pickable: true
    })
      /**
       * 绑定区块 GeoJSON 数据，告诉图层按 geojson 解析。
       */
      .source(polygonGeoJson, {
        parser: {
          type: "geojson"
        }
      })
      /**
       * 使用 extrude 形态把二维面挤出成 3D 板块。
       */
      .shape("extrude")
      /**
       * 用每个区县的 floatElevation 控制挤出高度。
       */
      .size("floatElevation")
      /**
       * 用 fillColor 作为区块主颜色。
       */
      .color("#71a4f0")
      // .color("fillColor", function mapFillColor(fillColor) {
      //   return fillColor;
      // })
      /**
       * 开启 hover 高亮，让鼠标移入时区块更容易被感知。
       */
      .active({
        color: "#85b6ff",
        mix: 0.3
      })
      /**
       * 配置板块透明度、抬升高度和上下表面表现。
       */
      .style({
        opacity: 1,
        pickLight: true,
        heightfixed: true,
        raisingHeight: 150,
        topsurface: true,
        sidesurface: true,
        sourceColor: "#1A5FD0",
        targetColor: "#071A37"
      })
  );
}

/**
 * 发光描边层负责给板块补一层柔和外发光。
 */
function createGlowBoundaryLayer(LineLayer, polygonGeoJson) {
  /**
   * 新建发光边界线图层，作为主描边外侧的柔光层。
   */
  return (
    new LineLayer({
      zIndex: 5,
      autoFit: false,
      pickable: false
    })
      /**
       * 复用区块 GeoJSON 边界来生成线数据。
       */
      .source(polygonGeoJson, {
        parser: {
          type: "geojson"
        }
      })
      /**
       * 使用 line 形态沿区块边界绘制线条。
       */
      .shape("line")
      /**
       * 发光边界比主描边更粗一点，便于形成外发光效果。
       */
      .size(2.6)
      /**
       * 使用统一青色作为外发光边颜色。
       */
      .color("#62E9FF")
      /**
       * 保持较低透明度，避免发光边抢过主体板块。
       */
      .style({
        opacity: 0.42
      })
  );
}

/**
 * 主描边层负责强化区块轮廓。
 */
function createBorderLayer(LineLayer, polygonGeoJson) {
  /**
   * 新建主描边层，负责把每个区县轮廓清晰勾出来。
   */
  return (
    new LineLayer({
      zIndex: 6,
      autoFit: false
    })
      /**
       * 绑定区块 GeoJSON，让边界轮廓与板块一一对应。
       */
      .source(polygonGeoJson, {
        parser: {
          type: "geojson"
        }
      })
      /**
       * 使用 line 形态绘制每个区县边界。
       */
      .shape("line")
      /**
       * 主描边比发光边更细，起到“清边”的作用。
       */
      .size(1.6)
      /**
       * 每个区县的描边颜色可以独立控制，主区块会更亮。
       */
      .color("borderColor", function mapBorderColor(borderColor) {
        return borderColor;
      })
      /**
       * 主描边保持完全可见，避免轮廓发虚。
       */
      .style({
        opacity: 1
      })
  );
}

/**
 * 标签层直接使用 L7 原生文字点图层，不额外维护 DOM 浮层。
 */
function createLabelLayer(PointLayer, labelGeoJson) {
  /**
   * 新建标签图层，专门承载区县名称文本。
   */
  return (
    new PointLayer({
      zIndex: 8,
      autoFit: false,
      pickable: false
    })
      /**
       * 绑定标签点 GeoJSON，每个点对应一个区县中心位置。
       */
      .source(labelGeoJson, {
        parser: {
          type: "geojson"
        }
      })
      /**
       * 使用 text 形态渲染区县名称。
       */
      .shape("name", "text")
      /**
       * 统一给标签一个基础字号。
       */
      .size(12)
      /**
       * 使用各区县配置好的标签颜色。
       */
      .color("labelColor", function mapLabelColor(labelColor) {
        return labelColor;
      })
      /**
       * 抬高文字层，避免和板块、柱状条发生遮挡。
       */
      .style({
        raisingHeight: 246,
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
      })
  );
}
