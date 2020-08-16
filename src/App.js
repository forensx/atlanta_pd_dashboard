import React, { useState } from "react";
import "antd/dist/antd.css";
import { StaticMap } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { Menu, Dropdown, Button, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import crimeData from "./data/data.json";

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
  const [data, setData] = useState(crimeData);
  const [crimeType, setCrimeType] = useState(null);
  const uniqueCrimeTypes = [...new Set(crimeData.map((crime) => crime.TYPE))];
  const crimeTypeMenu = (
    <Menu onClick={handleMenuClick}>
      {uniqueCrimeTypes.map((type, index) => (
        <Menu.Item key={index}>{type}</Menu.Item>
      ))}
      <Menu.Item key="ALL">All Crimes</Menu.Item>
    </Menu>
  );

  function handleMenuClick(e) {
    if (e.key === "ALL") {
      setCrimeType("ALL");
      setData(crimeData);
      message.success("Showing all crimes", 1);
    } else {
      setCrimeType(uniqueCrimeTypes[e.key]);
      setData(
        crimeData.filter((crime) => crime.TYPE === uniqueCrimeTypes[e.key])
      );
      message.success("Selected " + uniqueCrimeTypes[e.key], 1);
    }
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
            {crimeType ? crimeType : "Crime type"} <DownOutlined />
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
