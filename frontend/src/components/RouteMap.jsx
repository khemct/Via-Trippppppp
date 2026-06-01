import { useMemo, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, LoadScriptNext } from '@react-google-maps/api';
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

export default function RouteMap({ origin, destination, routePolyline, waypoints, height }) {
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const markersRef = useRef([]);

  const path = useMemo(() => routePolyline ? decodePolyline(routePolyline) : [], [routePolyline]);

  const center = useMemo(() =>
    path.length > 0
      ? path[Math.floor(path.length / 2)]
      : origin || { lat: 0, lng: 0 },
    [path, origin]
  );

  const mapStyle = useMemo(() => height ? { width: '100%', height } : containerStyle, [height]);

  const redrawOverlays = useCallback((map, ori, dest, pth, wps) => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (ori) {
      const m = new window.google.maps.Marker({
        position: ori,
        map,
        label: 'O',
      });
      markersRef.current.push(m);
    }

    if (dest) {
      const m = new window.google.maps.Marker({
        position: dest,
        map,
        label: 'D',
      });
      markersRef.current.push(m);
    }

    if (wps) {
      wps.forEach((wp) => {
        const m = new window.google.maps.Marker({
          position: { lat: wp.lat, lng: wp.lng },
          map,
          title: wp.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: waypointColor(wp.distance_from_route),
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
        });
        markersRef.current.push(m);
      });
    }

    if (pth.length > 0) {
      const pl = new window.google.maps.Polyline({
        path: pth,
        strokeColor: '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 4,
      });
      pl.setMap(map);
      polylineRef.current = pl;
    }
  }, []);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    redrawOverlays(map, origin, destination, path, waypoints);
  }, [origin, destination, path, waypoints, redrawOverlays]);

  const onMapUnmount = useCallback(() => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    mapRef.current = null;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    redrawOverlays(map, origin, destination, path, waypoints);
  }, [origin, destination, path, waypoints, redrawOverlays]);

  return (
    <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapStyle}
        center={center}
        zoom={7}
        options={defaultOptions}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
      />
    </LoadScriptNext>
  );
}
