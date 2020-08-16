import React from "react";
import "antd/dist/antd.css";
import { StaticMap } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { Menu, Dropdown, Button, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import data from "./data/data.json";

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoicGFudDIwMDIiLCJhIjoiY2prenlwb2ZtMHlnMjNxbW1ld3VxYWZ4cCJ9.rOb8DhCzsysBIw69MxyWKg"; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: -84.3963,
  latitude: 33.7556,
  zoom: 11,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

// let filtData = data.filter((crime) => crime.TYPE === "HOMICIDE");

export default function App({
  intensity = 1,
  threshold = 0.1,
  radiusPixels = 30,
  mapStyle = "mapbox://styles/mapbox/dark-v9",
}) {
  const uniqueCrimeTypes = [...new Set(data.map((crime) => crime.TYPE))];
  const crimeTypeMenu = (
    <Menu onClick={handleMenuClick}>
      {uniqueCrimeTypes.map((type, index) => (
        <Menu.Item key={index}>{type}</Menu.Item>
      ))}
    </Menu>
  );

  function handleMenuClick(e) {
    message.success("Selected " + uniqueCrimeTypes[e.key]);
  }

  const layers = [
    new HeatmapLayer({
      data,
      id: "heatmp-layer",
      pickable: false,
      getPosition: (d) => [d.COORDINATES[1], d.COORDINATES[0]],
      radiusPixels,
      intensity,
      threshold,
    }),
  ];

  return (
    <div
      className="container"
      style={{ height: "100vh", width: "100vw", padding: 0, margin: 0 }}
    >
      <div
        style={{
          zIndex: "1000",
          position: "absolute",
          marginTop: "1.5%",
          right: "2%",
        }}
      >
        <Dropdown overlay={crimeTypeMenu} placement="bottomRight">
          <Button>
            Crime type <DownOutlined />
          </Button>
        </Dropdown>
      </div>
      <div
        style={{
          zIndex: "-1",
        }}
      >
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
      </div>
    </div>
  );
}
