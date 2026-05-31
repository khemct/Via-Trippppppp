import { GoogleMap, LoadScriptNext, Polyline, Marker } from '@react-google-maps/api';
import { decodePolyline } from '../utils/polyline';

const containerStyle = { width: '100%', height: '400px' };

const defaultOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

export default function RouteMap({ origin, destination, routePolyline, height }) {
  const path = routePolyline ? decodePolyline(routePolyline) : [];

  const center =
    path.length > 0
      ? path[Math.floor(path.length / 2)]
      : origin || { lat: 0, lng: 0 };

  const mapStyle = height ? { width: '100%', height } : containerStyle;

  return (
    <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapStyle}
        center={center}
        zoom={7}
        options={defaultOptions}
      >
        {origin && <Marker position={origin} label="O" />}
        {destination && <Marker position={destination} label="D" />}
        {routePolyline && path.length > 0 && (
          <Polyline
            key={routePolyline}
            path={path}
            options={{
              strokeColor: '#2563eb',
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />
        )}
      </GoogleMap>
    </LoadScriptNext>
  );
}
