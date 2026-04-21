"use client";
import { useEffect, useRef } from "react";
import { Scene, PolygonLayer, LineLayer, getData } from "@antv/l7";
import { Map, Mapbox, GaodeMap } from "@antv/l7-maps";

function Test() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      (async function () {
        const response = await fetch("/json/330100.geojson");
        const geoData = await response.json();
        console.log(geoData);
        const l7Module = await import("@antv/l7/dist/l7.js");
        const L7 = l7Module?.default ?? l7Module;
        const { Scene, Map: L7Map, Mapbox, PolygonLayer, PointLayer } = L7;

        const scene = new Scene({
          id: mapRef.current,
          logoVisible: true,
          // map: new Mapbox({
          //   style: "blank",
          //   pitch: 0,
          //   zoom: 10,
          //   rotation: 0
          // })
          map: new L7Map({
            center: [120.1551, 30.2741],
            zoom: 10, 
          })
        });

        scene.on("loaded", function handleSceneLoaded() {
          console.log("场景加载完成");





             const filllayer = new PolygonLayer({
          name: "fill",
          zIndex: 3
        })
          .source(getData)
          .shape("extrude")
          .color("#ff0000")
          .size(100);
        scene.addLayer(filllayer);


        });

      })();
    }
  }, []);

  return <div ref={mapRef} className="bd w-full h-full"></div>;
}

export default Test;
