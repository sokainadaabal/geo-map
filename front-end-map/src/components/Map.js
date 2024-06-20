import React, { useRef, useEffect } from "react";
import { loadModules } from "esri-loader";

function Map() {
  const mapEl = useRef(null);

  useEffect(() => {
    let view;
    loadModules(
      [
        "esri/views/MapView",
        "esri/WebMap",
        "esri/layers/GeoJSONLayer",
        "esri/layers/CSVLayer"
      ],
      {
        css: true
      }
    ).then(([MapView, WebMap, GeoJSONLayer, CSVLayer]) => {
      const webmap = new WebMap({
        basemap: "topo-vector"
      });

      view = new MapView({
        map: webmap,
        center: [-83, 42],
        zoom: 0,
        // use the ref as a container
        container: mapEl.current
      });

      const geojsonLayer = new GeoJSONLayer({
        url: "http://localhost:8080/maroc.geojson" // Remplacez par votre URL locale
      });

      const csvLayer = new CSVLayer({
        url: "http://localhost:8080/your-csv-file.csv", // Remplacez par votre URL locale
        latitudeField: "latitude", // Remplacez par le nom du champ de latitude dans votre CSV
        longitudeField: "longitude" // Remplacez par le nom du champ de longitude dans votre CSV
      });

      webmap.add(geojsonLayer);
      webmap.add(csvLayer);
    });

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, []);

  return <div style={{ height: 1000 }} ref={mapEl}></div>;
}

export default Map;
