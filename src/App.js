import React from "react";
import { StaticMap } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import data from "./data/data.json";

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoicGFudDIwMDIiLCJhIjoiY2prenlwb2ZtMHlnMjNxbW1ld3VxYWZ4cCJ9.rOb8DhCzsysBIw69MxyWKg"; // eslint-disable-line

// const DATA_URL =
//   "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/screen-grid/uber-pickup-locations.json"; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: -84.3963,
  latitude: 33.7756,
  zoom: 11,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

export default function App({
  intensity = 1,
  threshold = 0.1,
  radiusPixels = 30,
  mapStyle = "mapbox://styles/mapbox/dark-v9",
}) {
  const processedData = data;
  console.log(processedData);
  const layers = [
    new HeatmapLayer({
      data: processedData,
      id: "heatmp-layer",
      pickable: false,
      getPosition: (d) => [d.COORDINATES[1], d.COORDINATES[0]],
      radiusPixels,
      intensity,
      threshold,
    }),
  ];

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
    >
      <StaticMap
        reuseMaps
        mapStyle={mapStyle}
        preventStyleDiffing={true}
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
      />
    </DeckGL>
  );
}
