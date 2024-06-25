import React, { useRef, useEffect, useState } from "react";
import "@arcgis/core/assets/esri/themes/light/main.css";
import esriConfig from "@arcgis/core/config";
import { loadModules } from "esri-loader";

// Configure le chemin vers les ressources ArcGIS
esriConfig.assetsPath = "https://js.arcgis.com/4.24/assets";

function MapComponent({ filterParams, layerVisibility }) {
  const mapEl = useRef(null);
  const [view, setView] = useState(null);
  const [layers, setLayers] = useState({});

  useEffect(() => {
    let mapView;
    const initializeMap = async () => {
      try {
        const [Map, MapView, GeoJSONLayer, CSVLayer, Sketch, GraphicsLayer] = await loadModules([
          "esri/Map",
          "esri/views/MapView",
          "esri/layers/GeoJSONLayer",
          "esri/layers/CSVLayer",
          "esri/widgets/Sketch",
          "esri/layers/GraphicsLayer"
        ]);

        const map = new Map({
          basemap: "topo-vector"
        });

        mapView = new MapView({
          container: mapEl.current,
          map: map,
          center: [-7, 32],
          zoom: 5
        });

        const geojsonLayerRegion = new GeoJSONLayer({
          url: "https://raw.githubusercontent.com/sokainadaabal/geo-map/main/data-map/regions.geojson",
          outFields: ["*"],
          popupTemplate: {
            title: 'Région: {NAME_1}',
            content: [{
              type: 'fields',
              fieldInfos: [
                { fieldName: 'NAME_1', label: 'Région' }
              ]
            }]
          }
        });

        const geojsonLayerProvince = new GeoJSONLayer({
          url: "https://raw.githubusercontent.com/sokainadaabal/geo-map/main/data-map/provinces.geojson",
          outFields: ["*"],
          popupTemplate: {
            title: 'Province: {NAME_2}',
            content: [{
              type: 'fields',
              fieldInfos: [
                { fieldName: 'NAME_1', label: 'Région' },
                { fieldName: 'NAME_2', label: 'Province' }
              ]
            }]
          }
        });

        const csvLayer = new CSVLayer({
          url: "https://raw.githubusercontent.com/sokainadaabal/geo-map/main/data-map/transport_stations.csv",
          latitudeField: "latitude",
          longitudeField: "longitude",
          outFields: ["*"],
          popupTemplate: {
            title: 'Station: {name}',
            content: [{
              type: 'fields',
              fieldInfos: [
                { fieldName: "name", label: "Nom" },
                { fieldName: "latitude", label: "Latitude" },
                { fieldName: "longitude", label: "Longitude" }
              ]
            }]
          }
        });

        const graphicsLayer = new GraphicsLayer();

        map.addMany([geojsonLayerRegion, geojsonLayerProvince, csvLayer, graphicsLayer]);

        const sketch = new Sketch({
          view: mapView,
          layer: graphicsLayer
        });

        mapView.ui.add(sketch, 'top-right');

        setView(mapView);
        setLayers({
          regions: geojsonLayerRegion,
          provinces: geojsonLayerProvince,
          stations: csvLayer
        });

        // Gérer les clics sur la carte pour afficher les informations
        mapView.on("click", (event) => {
          mapView.hitTest(event).then((response) => {
            if (response.results.length) {
              const graphic = response.results.filter(result => result.graphic.layer)[0]?.graphic;
              if (graphic && graphic.popupTemplate) {
                mapView.popup.open({
                  location: event.mapPoint,
                  title: graphic.popupTemplate.title || "Informations de position",
                  content: graphic.popupTemplate.content || "Aucune information disponible"
                });
              } else {
                // Si le graphic n'a pas de popupTemplate, on affiche un message générique
                mapView.popup.open({
                  location: event.mapPoint,
                  title: "Informations de position",
                  content: "Aucune information détaillée disponible pour cet élément."
                });
              }
            } else {
              mapView.popup.close();
            }
          });
        });

      } catch (error) {
        console.error("Erreur lors de l'initialisation de la carte :", error);
      }
    };

    initializeMap();

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (view && layers) {
      Object.entries(layerVisibility).forEach(([key, value]) => {
        if (layers[key]) {
          layers[key].visible = value;
        }
      });
    }
  }, [view, layers, layerVisibility]);

  useEffect(() => {
    if (view && layers && filterParams) {
      if (filterParams.region && layers.stations) {
        layers.stations.definitionExpression = `region = '${filterParams.region}'`;
      } else if (layers.stations) {
        layers.stations.definitionExpression = '1=1';
      }
    }
  }, [view, layers, filterParams]);

  const updateBasemap = (basemap) => {
    if (view) {
      view.map.basemap = basemap;
    }
  };

  return (
    <div style={{ position: "relative", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div ref={mapEl} style={{ flex: "1", position: "relative", height: "100%" }}></div>
      <div style={{ position: "absolute", bottom: "10px", margin: "10px", right: "10px", zIndex: 1, display: "flex", flexDirection: "row", gap: "10px" }}>
        <button style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "#0079c1", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", margin: "5px" }} onClick={() => updateBasemap("streets")}>Streets</button>
        <button style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "#0079c1", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", margin: "5px" }} onClick={() => updateBasemap("satellite")}>Satellite</button>
        <button style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "#0079c1", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", margin: "5px" }} onClick={() => updateBasemap("topo-vector")}>Topographic</button>
      </div>
    </div>
  );
}

export default MapComponent;