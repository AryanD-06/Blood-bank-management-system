import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

function MapWithRoute({ donorLocation, hospitalLocation }) {
  useEffect(() => {
    if (!donorLocation || !hospitalLocation) return;

    const map = L.map("routeMap").setView(donorLocation, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add routing control (draws path)
    L.Routing.control({
      waypoints: [
        L.latLng(donorLocation[0], donorLocation[1]),
        L.latLng(hospitalLocation[0], hospitalLocation[1]),
      ],
      routeWhileDragging: false,
      lineOptions: {
        styles: [{ color: "#dc3545", weight: 5 }],
      },
      createMarker: function (i, wp, nWps) {
        return L.marker(wp.latLng, {
          icon: L.icon({
            iconUrl:
              i === 0
                ? "https://cdn-icons-png.flaticon.com/512/149/149060.png" // donor
                : "https://cdn-icons-png.flaticon.com/512/684/684908.png", // hospital
            iconSize: [30, 30],
          }),
        }).bindPopup(i === 0 ? "You (Donor)" : "Hospital");
      },
    }).addTo(map);

    return () => map.remove();
  }, [donorLocation, hospitalLocation]);

  return <div id="routeMap" style={{ height: "400px", width: "100%", borderRadius: "10px" }} />;
}

export default MapWithRoute;
