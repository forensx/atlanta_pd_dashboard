import React, { useState, useMemo } from "react";
import "antd/dist/antd.css";
import { StaticMap } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { DataFilterExtension } from "@deck.gl/extensions";
import { Menu, Dropdown, Button, message, Slider } from "antd";
import { DownOutlined } from "@ant-design/icons";
import crimeData from "./data/data.json";
import { Typography } from "antd";
import { Statistic } from "antd";
import { Divider } from "antd";
import RangeInput from "./range-input";
const { Title, Text } = Typography;

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoicGFudDIwMDIiLCJhIjoiY2prenlwb2ZtMHlnMjNxbW1ld3VxYWZ4cCJ9.rOb8DhCzsysBIw69MxyWKg"; // eslint-disable-line

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.6,
  position: [-0.144528, 49.739968, 80000],
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.6,
  position: [-3.807751, 54.104682, 8000],
});

const lightingEffect = new LightingEffect({
  ambientLight,
  pointLight1,
  pointLight2,
});

const material = {
  ambient: 0.64,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [51, 51, 51],
};

const INITIAL_VIEW_STATE = {
  longitude: -84.3963,
  latitude: 33.7556,
  zoom: 11,
  maxZoom: 20,
  minZoom: 4,
  pitch: 60,
  bearing: 0,
};

export const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78],
];

export const heatmapColorRange = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [240, 59, 32],
  [189, 0, 38],
];

function getTooltip({ object }) {
  if (!object) {
    return null;
  }
  const lat = object.position[1];
  const lng = object.position[0];
  const count = object.points.length;

  return `\
    Latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ""}
    Longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ""}
    ${count} Crimes`;
}

function getCrimeCount(data) {
  return data.length;
}

const dataFilter = new DataFilterExtension({
  filterSize: 1,
  fp64: false,
});

function getTimeRange(data) {
  if (!data) {
    return null;
  }
  return data.reduce(
    (range, d) => {
      const t = d.DATE;

      range[0] = Math.min(range[0], t);
      range[1] = Math.max(range[1], t);
      return range;
    },
    [Infinity, -Infinity]
  );
}

function formatLabel(t) {
  const date = new Date(t);
  return `${date.getUTCFullYear()}/${
    date.getUTCMonth() + 1
  }/${date.getUTCDate()}`;
}

export default function App({
  intensity = 1,
  threshold = 0.1,
  radiusPixels = 30,
  mapStyle = "mapbox://styles/mapbox/dark-v9",
  // upperPercentile = 100,
  coverage = 1,
}) {
  const [vizType, setVizType] = useState("Hexagon");
  const [data, setData] = useState(crimeData);

  const [percentile, setPercentile] = useState([0, 100]);

  const [filter, setFilter] = useState(null);
  const timeRange = useMemo(() => getTimeRange(data), [data]);
  const filterValue = filter || timeRange;

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

  function onSliderChange(value) {
    setPercentile(value);
  }

  const vizTypeMenu = (
    <Menu onClick={handleVizChange}>
      <Menu.Item key="Hexagon">Hexagon</Menu.Item>
      <Menu.Item key="Heatmap">Heatmap</Menu.Item>
    </Menu>
  );

  function handleVizChange(e) {
    setVizType(e.key);
    message.success("Selected " + e.key, 1);
  }

  const layers = [
    data && vizType === "Heatmap"
      ? new HeatmapLayer({
          data,
          colorRange: heatmapColorRange,
          id: "heatmp-layer",
          pickable: true,
          getPosition: (d) => [d.COORDINATES[1], d.COORDINATES[0]],
          getFilterValue: (d) => d.DATE,
          filterRange: [filterValue[0], filterValue[1]],
          filterSoftRange: [
            filterValue[0] * 0.9 + filterValue[1] * 0.1,
            filterValue[0] * 0.1 + filterValue[1] * 0.9,
          ],
          extensions: [dataFilter],
          upperPercentile: percentile[1],
          lowerPercentile: percentile[0],
          radiusPixels,
          intensity,
          threshold,
        })
      : vizType === "Hexagon"
      ? new HexagonLayer({
          id: "hexagon",
          colorRange,
          coverage,
          data,
          elevationRange: [0, 200],
          elevationScale: data && data.length ? 50 : 0,
          extruded: true,
          getPosition: (d) => [d.COORDINATES[1], d.COORDINATES[0]],
          pickable: true,
          radius: 100,
          upperPercentile: percentile[1],
          lowerPercentile: percentile[0],
          material,

          transitions: {
            elevationScale: 1000,
          },
        })
      : null,
  ];

  const MS_PER_DAY = 8.64e7;

  return (
    <div
      className="container"
      style={{ height: "100vh", width: "100vw", padding: 0, margin: 0 }}
    >
      <div
        style={{
          backgroundColor: "white",
          zIndex: "1000",
          position: "absolute",
          marginTop: "1.0%",
          right: "1.5%",
          display: "flex",
          flexDirection: "column",
          height: "470px",
          width: "340px",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingTop: "12px",
        }}
      >
        <Title level={4}>Atlanta Crime Dashboard</Title>
        <Text>All reported crimes in Atlanta in 2019.</Text>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
            paddingTop: "16px",
          }}
        >
          {vizType === "Hexagon"
            ? colorRange.map((color) => (
                <div
                  style={{
                    width: "16.6667%",
                    height: "18px",
                    backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                  }}
                />
              ))
            : heatmapColorRange.map((color) => (
                <div
                  style={{
                    width: "16.6667%",
                    height: "18px",
                    backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                  }}
                />
              ))}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "6px",
          }}
        >
          <Text>Fewer crimes</Text>
          <Text>More crimes</Text>
        </div>
        <div style={{ paddingTop: "12px" }}>
          <Text>
            Data source:{" "}
            <a href="http://opendata.atlantapd.org/Default.aspx">
              APD Open Data Portal
            </a>
          </Text>
        </div>
        <div style={{ paddingTop: "12px" }}>
          <Statistic title="Crimes" value={getCrimeCount(data)} />
        </div>
        {vizType === "Hexagon" ? (
          <div style={{ paddingTop: "12px" }}>
            <Text>Filter by percentile</Text>
            <Slider
              range
              // tooltipVisible
              defaultValue={[0, 100]}
              marks={{ 0: "0", 100: "100" }}
              onAfterChange={onSliderChange}
            />
          </div>
        ) : null}
        <Divider />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "space-around",
          }}
        >
          <Dropdown overlay={crimeTypeMenu} placement="bottomRight">
            <Button>
              {crimeType ? crimeType : "Crime type"} <DownOutlined />
            </Button>
          </Dropdown>
          <Dropdown overlay={vizTypeMenu} placement="bottomRight">
            <Button>
              {vizType ? vizType : "Choose visualization type"} <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <div style={{ paddingTop: "24px", paddingLeft: "60%" }}>
          <Text>
            View Code:{" "}
            <a href="https://github.com/forensx/atlanta_pd_dashboard">GitHub</a>
          </Text>
        </div>
      </div>
      <div
        style={{
          zIndex: "-1",
        }}
      >
        <DeckGL
          effects={[lightingEffect]}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={layers}
          getTooltip={getTooltip}
        >
          <StaticMap
            reuseMaps
            mapStyle={mapStyle}
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          />
        </DeckGL>
        {timeRange && vizType === "Heatmap" && (
          <RangeInput
            min={timeRange[0]}
            max={timeRange[1]}
            value={filterValue}
            formatLabel={formatLabel}
            animationSpeed={MS_PER_DAY}
            onChange={setFilter}
          />
        )}
      </div>
    </div>
  );
}
