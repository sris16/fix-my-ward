import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";

function LocationMarker({ setCoords }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setCoords({ latitude: lat, longitude: lng });
    },
  });

  return null;
}

// 🔥 NEW COMPONENT
function RecenterMap({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords.latitude && coords.longitude) {
      map.setView([coords.latitude, coords.longitude], 15);
    }
  }, [coords, map]);

  return null;
}

function MapPicker({ coords, setCoords }) {
  return (
    <MapContainer
      center={[11.0168, 76.9558]}
      zoom={13}
      className="h-64 w-full rounded"
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationMarker setCoords={setCoords} />

      {/* 🔥 ADD THIS */}
      <RecenterMap coords={coords} />

      {coords.latitude && coords.longitude && (
        <Marker position={[coords.latitude, coords.longitude]} />
      )}
    </MapContainer>
  );
}

export default MapPicker;