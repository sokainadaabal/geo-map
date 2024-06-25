import React, { useRef, useEffect, useState } from "react";
import { loadModules } from "esri-loader";
import Chart from 'chart.js/auto';

function MapComponent() {
  const mapEl = useRef(null);
  const chartEl = useRef(null);
  const [view, setView] = useState(null);
  const [chart, setChart] = useState(null);
  const [basemap, setBasemap] = useState("topo-vector");

  useEffect(() => {
    if (mapEl.current && !mapEl.current.hasChildNodes()) {
      loadModules(
        [
          "esri/views/MapView",
          "esri/WebMap",
          "esri/layers/GeoJSONLayer",
          "esri/layers/CSVLayer",
          "esri/widgets/Sketch",
          "esri/widgets/LayerList",
          "esri/widgets/Search",
        ],
        { css: true }
      ).then(([MapView, WebMap, GeoJSONLayer, CSVLayer, Sketch, LayerList, Search]) => {
        const webmap = new WebMap({
          basemap: basemap
        });

        const mapView = new MapView({
          map: webmap,
          center: [-7, 32],
          zoom: 5,
          container: mapEl.current
        });

        setView(mapView);

        const geojsonLayerRegion = new GeoJSONLayer({
          url: "https://raw.githubusercontent.com/sokainadaabal/geo-map/main/data-map/region.geojson",
          outFields: ["*"],
          popupTemplate: {
            title: "Région: {nom_region}",
            content: [{
              type: "fields",
              fieldInfos: [
                { fieldName: "nom_region", label: "Nom de la région" },
                { fieldName: "shape_area", label: "Surface" }
              ]
            }]
          }
        });

        const geojsonLayerProvince = new GeoJSONLayer({
          url: "https://raw.githubusercontent.com/sokainadaabal/geo-map/main/data-map/provinces.geojson",
          outFields: ["*"],
          popupTemplate: {
            title: "Province: {nom_provin}",
            content: [{
              type: "fields",
              fieldInfos: [
                { fieldName: "nom_provin", label: "Nom de la province" },
                { fieldName: "shape_area", label: "Surface" }
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
            title: "Station de transport",
            content: [{
              type: "fields",
              fieldInfos: [
                { fieldName: "name", label: "Nom" },
                { fieldName: "type", label: "Type" },
                { fieldName: "capacity", label: "Capacité" }
              ]
            }]
          }
        });

        webmap.addMany([geojsonLayerRegion, geojsonLayerProvince, csvLayer]);

        mapView.ui.add(new Sketch({ view: mapView, layer: csvLayer }), "top-right");
        mapView.ui.add(new LayerList({ view: mapView }), "top-left");
        mapView.ui.add(new Search({
          view: mapView,
          sources: [{
            layer: csvLayer,
            searchFields: ["name", "type"],
            displayField: "name",
            exactMatch: false,
            outFields: ["*"],
            name: "Transport Stations",
            placeholder: "Rechercher des stations de transport"
          }]
        }), "top-right");

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
                title: "Informations de position",
                content: content
              });

              if (graphic.layer === geojsonLayerRegion || graphic.layer === geojsonLayerProvince) {
                const query = csvLayer.createQuery();
                query.geometry = graphic.geometry;
                query.spatialRelationship = "intersects";
                csvLayer.queryFeatures(query).then((result) => {
                  csvLayer.definitionExpression = `OBJECTID IN (${result.features.map(f => f.attributes.OBJECTID).join(',')})`;
                  updateChart(result.features);
                });
              }
            } else {
              mapView.popup.close();
            }
          });
        });
      }).catch(err => console.error("Error loading modules:", err));
    }

    return () => {
      if (view) {
        view.destroy();
      }
      if (chart) {
        chart.destroy();
      }
    };
  }, [basemap]);

  const updateChart = (features) => {
    const typeCount = {};
    features.forEach((feature) => {
      const type = feature.attributes.type;
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const data = {
      labels: Object.keys(typeCount),
      datasets: [{
        label: 'Nombre de stations par type',
        data: Object.values(typeCount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
    };

    if (chart) {
      chart.data = data;
      chart.update();
    } else {
      const newChart = new Chart(chartEl.current, {
        type: 'bar',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Stations de transport par type' }
          }
        }
      });
      setChart(newChart);
    }
  };

  const updateBasemap = (newBasemap) => {
    setBasemap(newBasemap);
  };

  return (
    <div style={{ position: "relative", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", height: "calc(100% - 60px)" }}>
        <div ref={mapEl} style={{ flex: "2", position: "relative", height: "100%" }}></div>
        <div style={{ flex: "1", padding: "20px", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: "1", minHeight: "300px" }}>
            <canvas ref={chartEl} style={{ width: "100%", height: "100%" }}></canvas>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: "10px", margin: "10px", right: "10px", zIndex: 1, display: "flex", flexDirection: "row", gap: "10px" }}>
        <button style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "#0079c1", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", margin: "5px" }} onClick={() => updateBasemap("streets")}>Rues</button>
        <button style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "#0079c1", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", margin: "5px" }} onClick={() => updateBasemap("satellite")}>Satellite</button>
        <button style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "#0079c1", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", margin: "5px" }} onClick={() => updateBasemap("topo-vector")}>Topographique</button>
      </div>
    </div>
  );
}

export default MapComponent;