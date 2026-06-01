import { useMemo, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, LoadScriptNext, Marker } from '@react-google-maps/api';
import { decodePolyline } from '../utils/polyline';

const containerStyle = { width: '100%', height: '400px' };

const defaultOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy',
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

export default function RouteMap({ origin, destination, routePolyline, waypoints, height }) {
  const mapRef = useRef(null);
  const polylineRef = useRef(null);

  const path = useMemo(() => routePolyline ? decodePolyline(routePolyline) : [], [routePolyline]);

  const center = useMemo(() =>
    path.length > 0
      ? path[Math.floor(path.length / 2)]
      : origin || { lat: 0, lng: 0 },
    [path, origin]
  );

  const mapStyle = useMemo(() => height ? { width: '100%', height } : containerStyle, [height]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    if (path.length > 0) {
      const polyline = new window.google.maps.Polyline({
        path,
        strokeColor: '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 4,
      });
      polyline.setMap(map);
      polylineRef.current = polyline;
    }
  }, [path]);

  const onMapUnmount = useCallback(() => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    mapRef.current = null;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (path.length === 0) return;

    const polyline = new window.google.maps.Polyline({
      path,
      strokeColor: '#2563eb',
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });
    polyline.setMap(map);
    polylineRef.current = polyline;
  }, [path]);

  return (
    <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapStyle}
        center={center}
        zoom={7}
        options={defaultOptions}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
      >
        {origin && <Marker position={origin} label="O" />}
        {destination && <Marker position={destination} label="D" />}
        {waypoints && waypoints.map((wp) => (
          <WaypointMarker key={wp.waypoint_id || wp.place_id} wp={wp} />
        ))}
      </GoogleMap>
    </LoadScriptNext>
  );
}
