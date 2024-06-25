import React, { useRef, useEffect, useState } from "react";
import "@arcgis/core/assets/esri/themes/light/main.css";
import esriConfig from "@arcgis/core/config";
import { loadModules } from "esri-loader";

esriConfig.assetsPath = "https://js.arcgis.com/4.24/assets";

function MapComponent({ filterParams, layerVisibility }) {
  const mapEl = useRef(null);
  const [view, setView] = useState(null);
  const [layers, setLayers] = useState({});

  useEffect(() => {
    let mapView;
    const initializeMap = async () => {
      try {
        const [Map, MapView, GeoJSONLayer, CSVLayer, Sketch, GraphicsLayer, FeatureLayer, Point, Graphic] = await loadModules([
          "esri/Map",
          "esri/views/MapView",
          "esri/layers/GeoJSONLayer",
          "esri/layers/CSVLayer",
          "esri/widgets/Sketch",
          "esri/layers/GraphicsLayer",
          "esri/layers/FeatureLayer",
          "esri/geometry/Point",
          "esri/Graphic"
        ]);

        console.log("Modules chargés avec succès");

        const map = new Map({
          basemap: "topo-vector"
        });

        mapView = new MapView({
          container: mapEl.current,
          map: map,
          center: [-7, 32],
          zoom: 5
        });

        console.log("Vue de la carte créée");

        const geojsonLayerRegion = new GeoJSONLayer({
          url: "https://raw.githubusercontent.com/sokainadaabal/geo-map/main/data-map/regions.geojson",
          outFields: ["*"],
          visible: true,
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-fill",
              color: [255, 0, 0, 0.2],
              outline: {
                color: [255, 0, 0, 1],
                width: 1
              }
            }
          },
          popupTemplate: {
            title: 'Région: {NAME_1}',
            content: [{
              type: 'fields',
              fieldInfos: ["*"]
            }]
          }
        });

        const geojsonLayerProvince = new GeoJSONLayer({
          url: "https://raw.githubusercontent.com/sokainadaabal/geo-map/main/data-map/provinces.geojson",
          outFields: ["*"],
          visible: true,
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-fill",
              color: [0, 255, 0, 0.2],
              outline: {
                color: [0, 255, 0, 1],
                width: 1
              }
            }
          },
          popupTemplate: {
            title: 'Province: {NAME_2}',
            content: [{
              type: 'fields',
              fieldInfos:["*"]
            }]
          }
        });

        const csvLayer = new CSVLayer({
          url: "https://raw.githubusercontent.com/sokainadaabal/geo-map/main/data-map/transport_stations.csv",
          latitudeField: "latitude",
          longitudeField: "longitude",
          outFields: ["*"],
          visible: true,
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-marker",
              color: [0, 0, 255],
              size: 6,
              outline: {
                color: [255, 255, 255],
                width: 1
              }
            }
          },
          popupTemplate: {
            title: 'Station: {name}',
            content: [{
              type: 'fields',
              fieldInfos: ["*"]
            }]
          }
        });

        const graphicsLayer = new GraphicsLayer();

        console.log("Couches créées");

        // Attendre que toutes les couches soient chargées avant de les ajouter à la carte
        await Promise.all([
          geojsonLayerRegion.load(),
          geojsonLayerProvince.load(),
          csvLayer.load()
        ]).catch(error => {
          console.error("Erreur lors du chargement des couches:", error);
        });

        console.log("Couches chargées");

        map.addMany([geojsonLayerRegion, geojsonLayerProvince, csvLayer, graphicsLayer]);

        console.log("Couches ajoutées à la carte");

        // Ajouter un point de test
        const testPoint = new Point({
          longitude: -7,
          latitude: 32
        });
        const testGraphic = new Graphic({
          geometry: testPoint,
          symbol: {
            type: "simple-marker",
            color: [226, 119, 40],
            size: 8,
            outline: {
              color: [255, 255, 255],
              width: 2
            }
          }
        });
        graphicsLayer.add(testGraphic);

        const sketch = new Sketch({
          view: mapView,
          layer: graphicsLayer,
          creationMode: "update"
        });

        mapView.ui.add(sketch, 'top-right');

        setView(mapView);
        setLayers({
          regions: geojsonLayerRegion,
          provinces: geojsonLayerProvince,
          stations: csvLayer
        });

        // Ajuster l'étendue de la carte pour montrer toutes les couches
        Promise.all([geojsonLayerRegion.when(), geojsonLayerProvince.when(), csvLayer.when()]).then(() => {
          const fullExtent = geojsonLayerRegion.fullExtent.union(geojsonLayerProvince.fullExtent).union(csvLayer.fullExtent);
          mapView.goTo(fullExtent);
        });

        // Add select functionality
        mapView.on("click", (event) => {
          const screenPoint = {
            x: event.x,
            y: event.y
          };

          mapView.hitTest(screenPoint).then((response) => {
            const graphics = response.results.filter(result => result.graphic.layer);
            if (graphics.length > 0) {
              const graphic = graphics[0].graphic;
              if (graphic.attributes) {
                const content = Object.entries(graphic.attributes)
                  .map(([key, value]) => `<b>${key}:</b> ${value}`)
                  .join("<br>");
                mapView.popup.open({
                  title: "Object Attributes",
                  content: content,
                  location: event.mapPoint
                });
              }
            } else {
              mapView.popup.close();
            }
          });
        });

        console.log("Initialisation de la carte terminée");

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
          console.log(`Visibilité de la couche ${key} définie sur ${value}`);
        }
      });
    }
  }, [view, layers, layerVisibility]);

  useEffect(() => {
    if (view && layers && filterParams) {
      if (filterParams.region && layers.stations) {
        layers.stations.definitionExpression = `region = '${filterParams.region}'`;
        console.log(`Filtre appliqué : region = '${filterParams.region}'`);
      } else if (layers.stations) {
        layers.stations.definitionExpression = '1=1';
        console.log("Filtre réinitialisé");
      }
    }
  }, [view, layers, filterParams]);

  const updateBasemap = (basemap) => {
    if (view) {
      view.map.basemap = basemap;
      console.log(`Fond de carte mis à jour : ${basemap}`);
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