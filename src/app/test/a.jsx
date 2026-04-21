"use client";

import { useEffect, useRef } from "react";

/**
 * 测试页地图只保留两件事：
 * 1. 请求静态 GeoJSON
 * 2. 初始化一个干净的 L7 地图场景
 */
export default function TestHangzhouL7Map() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const geoJsonRef = useRef(null);

  /**
   * 参考目标文件的初始化方式：
   * 在同一个 useEffect 里完成数据请求和地图初始化。
   */
  useEffect(function initMapEffect() {
    let isDisposed = false;

    /**
     * 初始化测试页地图。
     * 当前只做两件事：读取 GeoJSON 原始数据、创建一个干净的 L7 Scene。
     */
    async function initMap() {
      const containerElement = containerRef.current;
      if (typeof window === "undefined" || !containerRef.current) return;

      if (!containerElement) {
        return;
      }

      sceneRef.current = null;

      /**
       * 先读取测试页需要的 GeoJSON 原始数据。
       * 后续你要加图层时，可以直接使用 geoJsonRef.current。
       */
      const response = await fetch("/json/330100.geojson");
      const nextGeoJsonData = await response.json();

      if (isDisposed) {
        return;
      }

      geoJsonRef.current = nextGeoJsonData;

      /**
       * 动态加载 L7 单包入口。
       * 这里不再单独依赖 @antv/l7-maps，保持和参考项目一致。
       */
      const l7Module = await import("@antv/l7/dist/l7.js");
      const L7 = l7Module?.default ?? l7Module;
      const { Scene, Map: L7Map, Mapbox, PolygonLayer, PointLayer } = L7;

      if (isDisposed || !containerRef.current) {
        return;
      }

      /**
       * 创建测试页地图实例。
       * 当前只保留最基础视角参数，后续你可以直接在这里继续扩展。
       */
      const scene = new Scene({
        id: containerElement,
        logoVisible: true,
        // map: new Mapbox({
        //   style: "blank",
        //   pitch: 0,
        //   zoom: 10,
        //   rotation: 0
        // })
        map: new L7Map({
          center: [120.1551, 30.2741],
          zoom: 20,
          pitch: 0,
          rotation: 0,
          dragRotate: true,
          touchZoomRotate: true,
          doubleClickZoom: true,
          keyboard: false
        })
      });

      sceneRef.current = scene;

      /**
       * 场景加载完成后显示容器。
       */
      scene.on("loaded", function handleSceneLoaded() {
        if (isDisposed || sceneRef.current !== scene) {
          return;
        }

        const filllayer = new PolygonLayer({
          name: "fill",
          zIndex: 3
        })
          .source(nextGeoJsonData)
          .shape("extrude")
          .color("#ff0000")
          .size(100);
        scene.addLayer(filllayer);

        const aaa = new PolygonLayer({
          zIndex: 4,
          autoFit: false,
          pickable: true
        })
          .source(nextGeoJsonData, {
            parser: {
              type: "geojson"
            }
          })
          .shape("extrude")
          .size("floatElevation")
          .color("#71a4f0")
          .style({
            opacity: 1,
            pickLight: true,
            heightfixed: true,
            raisingHeight: 150,
            topsurface: true,
            sidesurface: true,
            sourceColor: "#1A5FD0",
            targetColor: "#071A37"
          });

        scene.addLayer(aaa);
      });
    }

    initMap().catch(function handleInitMapError(error) {
      console.error("Init test map failed", error);
    });

    return function cleanupInitMapEffect() {
      isDisposed = true;
    };
  }, []);

  return <div ref={containerRef} className=" w-100 h-100 bd" />;
}
