import React, { useRef, useEffect, useState } from "react";
import { loadModules } from "esri-loader";

function Map() {
  const mapEl = useRef(null);
  const [view, setView] = useState(null);

  useEffect(() => {
    loadModules(
      [
        "esri/views/MapView",
        "esri/WebMap",
        "esri/layers/GeoJSONLayer",
        "esri/layers/CSVLayer"
      ],
      { css: true }
    ).then(([MapView, WebMap, GeoJSONLayer, CSVLayer]) => {

      const webmap = new WebMap({
        basemap: "topo-vector"
      });

      const mapView = new MapView({
        map: webmap,
        center: [-7, 32],
        zoom: 6,
        container: mapEl.current,
        ui: {
          components: ["zoom","attribution"]
        }
      });

      setView(mapView);    
      const geojsonLayerRegion = new GeoJSONLayer({
        url: "https://raw.githubusercontent.com/sokainadaabal/geo-map/main/data-map/region.geojson",
        outFields: ["*"]
      });
      const geojsonLayerProvince = new GeoJSONLayer({
        url: "https://raw.githubusercontent.com/sokainadaabal/geo-map/main/data-map/provinces.geojson",
        outFields: ["*"]
      });
      const csvLayer = new CSVLayer({
        url: "https://raw.githubusercontent.com/sokainadaabal/geo-map/main/data-map/transport_stations.csv",
        latitudeField: "latitude",
        longitudeField: "longitude",
        outFields: ["*"]
      });

      webmap.addMany([geojsonLayerRegion, geojsonLayerProvince, csvLayer]);

      mapView.on("click", (event) => {
        mapView.hitTest(event).then((response) => {
          if (response.results.length) {
            const graphic = response.results.filter(result => result.graphic.layer)[0].graphic;
            const attributes = graphic.attributes;

            const content = document.createElement("div");
            for (const key in attributes) {
              const attribute = document.createElement("div");
              attribute.textContent = `${key}: ${attributes[key]}`;
              content.appendChild(attribute);
            }

            mapView.popup.open({
              location: event.mapPoint,
              title: "Informations",
              content: content
            });
          } else {
            mapView.popup.close();
          }
        });
      });
    }).catch(err => console.error("Error loading modules:", err));

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, []);
  
  const updateBasemap = (basemap) => {
    if (view) {
      view.map.basemap = basemap;
    }
  };

  return (
    <div style={{ position: "relative", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div ref={mapEl} style={{ flex: "1", position: "relative", height: "100%" }}></div>
      <div style={{ position: "absolute", bottom: "10px", right: "10px", zIndex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        <button style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "#0079c1", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", margin: "5px" }} onClick={() => updateBasemap("streets")}>Streets</button>
        <button style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "#0079c1", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", margin: "5px" }} onClick={() => updateBasemap("satellite")}>Satellite</button>
        <button style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "#0079c1", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", margin: "5px" }} onClick={() => updateBasemap("topo-vector")}>Topographic</button>
      </div>
    </div>
  );
}

export default Map;
