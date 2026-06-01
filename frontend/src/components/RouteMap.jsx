import { memo, useMemo } from 'react';
import { GoogleMap, LoadScriptNext, Polyline, Marker } from '@react-google-maps/api';
import { decodePolyline } from '../utils/polyline';

const containerStyle = { width: '100%', height: '400px' };

const defaultOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy',
};

const polylineOptions = {
  strokeColor: '#2563eb',
  strokeOpacity: 0.8,
  strokeWeight: 4,
};

function waypointColor(dist) {
  if (dist < 1000) return '#4a6741';
  if (dist < 3000) return '#d97706';
  return '#dc2626';
}

function WaypointMarker({ wp }) {
  const col = waypointColor(wp.distance_from_route);
  return (
    <Marker
      position={{ lat: wp.lat, lng: wp.lng }}
      icon={{
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: col,
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
      }}
      title={wp.name}
    />
  );
}

function RouteMap({ origin, destination, routePolyline, waypoints, height }) {
  const path = useMemo(() => routePolyline ? decodePolyline(routePolyline) : [], [routePolyline]);

  const center = useMemo(() =>
    path.length > 0
      ? path[Math.floor(path.length / 2)]
      : origin || { lat: 0, lng: 0 },
    [path, origin]
  );

  const mapStyle = useMemo(() => height ? { width: '100%', height } : containerStyle, [height]);

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
            key="route-polyline"
            path={path}
            options={polylineOptions}
          />
        )}
        {waypoints && waypoints.map((wp) => (
          <WaypointMarker key={wp.waypoint_id || wp.place_id} wp={wp} />
        ))}
      </GoogleMap>
    </LoadScriptNext>
  );
}

export default memo(RouteMap);
