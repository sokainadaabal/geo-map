import React, { useRef, useEffect, useState } from "react";
import "@arcgis/core/assets/esri/themes/light/main.css";
import esriConfig from "@arcgis/core/config";
import { loadModules } from "esri-loader";

esriConfig.assetsPath = "https://js.arcgis.com/4.24/assets";

function MapComponent({ filterParams, layerVisibility }) {
  const mapEl = useRef(null);
  const [view, setView] = useState(null);
  const [layers, setLayers] = useState({});
  const [editingFeature, setEditingFeature] = useState(null);
  const [editingAttributes, setEditingAttributes] = useState({});

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
              fieldInfos: [{
                fieldName: "*"
              }]
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
              fieldInfos: [{
                fieldName: "*"
              }]
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
              fieldInfos: [{
                fieldName: "*"
              }]
            }]
          }
        });

        const graphicsLayer = new GraphicsLayer();

        map.addMany([geojsonLayerRegion, geojsonLayerProvince, csvLayer, graphicsLayer]);

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

        // Attendre que toutes les couches soient chargées avant de définir l'étendue
        await Promise.all([geojsonLayerRegion.load(), geojsonLayerProvince.load(), csvLayer.load()]);

        const fullExtent = geojsonLayerRegion.fullExtent.union(geojsonLayerProvince.fullExtent).union(csvLayer.fullExtent);
        mapView.goTo(fullExtent);

        mapView.on("click", (event) => {
          mapView.hitTest(event).then((response) => {
            const result = response.results.find(result => 
              result.graphic && result.graphic.layer && result.graphic.layer.type === "feature"
            );
        
            if (result && result.graphic) {
              const graphic = result.graphic;
              const attributes = graphic.attributes;
              setEditingFeature(graphic);
              setEditingAttributes(attributes);

              let content = "<table>";
              for (let key in attributes) {
                if (attributes.hasOwnProperty(key)) {
                  content += `<tr><th>${key}</th><td>${attributes[key]}</td></tr>`;
                }
              }
              content += "</table>";
        
              mapView.popup.open({
                title: "Informations détaillées",
                content: content,
                location: event.mapPoint
              });
            } else {
              mapView.popup.close();
              setEditingFeature(null);
              setEditingAttributes({});
            }
          }).catch(error => {
            console.error("Erreur lors du hitTest:", error);
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

  const updateAttributes = (newAttributes) => {
    if (editingFeature) {
      editingFeature.attributes = { ...editingFeature.attributes, ...newAttributes };
      setEditingAttributes(editingFeature.attributes);
      // Ici, vous devriez également mettre à jour la couche de caractéristiques
      editingFeature.layer.applyEdits({ updateFeatures: [editingFeature] });
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
      {editingFeature && (
        <div style={{ position: "absolute", bottom: "10px", left: "10px", background: "white", padding: "10px" }}>
          <h3>Édition des attributs</h3>
          {Object.entries(editingAttributes).map(([key, value]) => (
            <div key={key}>
              <label>{key}: </label>
              <input 
                type="text" 
                value={value} 
                onChange={(e) => updateAttributes({ [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MapComponent;