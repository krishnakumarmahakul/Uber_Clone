import React from "react";
import "remixicon/fonts/remixicon.css";

function LocationSearchPanel({vehiclePanel, setVehiclePanel, setPanelOpen, setPickup, setDestination, activeField }) {
  const handleSuggestionClick = (suggestion) => {
    setVehiclePanel(true);
    setPanelOpen(false);
    if (activeField === "pickup") {
      setPickup(suggestion);
    } else if (activeField === "destination") {
      setDestination(suggestion);
    }
  };

  const locations = [
    { name: "Bhubaneswar Railway Station", type: "Train", icon: "ri-train-line" },
    { name: "Bhubaneswar Airport (BBI)", type: "Airport", icon: "ri-flight-takeoff-line" },
    { name: "Master Canteen Square", type: "Location", icon: "ri-map-pin-2-line" },
    { name: "KIIT University", type: "University", icon: "ri-graduation-cap-line" },
    { name: "DN Regalia Mall", type: "Mall", icon: "ri-building-2-line" },
  ];

  return (
    <div className="p-4 bg-white rounded-xl shadow-md w-full">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <i className="ri-map-pin-line text-xl"></i> Suggested Locations
      </h2>
      <ul className="space-y-3">
        {locations.map((loc, index) => (
          <li
            
            key={index}
            onClick={() => handleSuggestionClick(loc.name)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <i className={`${loc.icon} text-xl text-gray-600`}></i>
            <span>{loc.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LocationSearchPanel;
