import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";

function LiveTraking() {
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty", // Working OpenFreeMap style URL
      center: [85.8245, 20.2961], // Longitude, Latitude
      zoom: 11,
    });
    return () => map.remove();
  }, []);

  return (
    <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />
  );
}

export default LiveTraking;
