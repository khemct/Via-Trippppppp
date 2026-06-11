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

function haversine(p1, p2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) *
      Math.cos(toRad(p2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function samplePoints(points, intervalKm) {
  if (!points || points.length === 0) return [];
  const sampled = [points[0]];
  let accumulated = 0;
  const intervalM = intervalKm * 1000;
  for (let i = 1; i < points.length; i++) {
    accumulated += haversine(points[i - 1], points[i]);
    if (accumulated >= intervalM) {
      sampled.push(points[i]);
      accumulated = 0;
    }
  }
  if (sampled[sampled.length - 1] !== points[points.length - 1]) {
    sampled.push(points[points.length - 1]);
  }
  return sampled;
}

export default function RouteMap({ origin, destination, routePolyline, waypoints, maxDetourKm, height, onWaypointClick }) {
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const markersRef = useRef([]);
  const circlesRef = useRef([]);

  const path = useMemo(() => routePolyline ? decodePolyline(routePolyline) : [], [routePolyline]);

  const center = useMemo(() =>
    path.length > 0
      ? path[Math.floor(path.length / 2)]
      : origin || { lat: 0, lng: 0 },
    [path, origin]
  );

  const mapStyle = useMemo(() => height ? { width: '100%', height } : containerStyle, [height]);

  const redrawOverlays = useCallback((map, ori, dest, pth, wps, maxKm, onWpClick) => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];

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
        if (onWpClick) {
          m.addListener('click', () => onWpClick(wp));
        }
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

      if (maxKm && maxKm > 0) {
        const detourM = maxKm * 1000;
        const interval = Math.max(1, (detourM * 2) / 1000);
        const pts = samplePoints(pth, interval);
        pts.forEach((pt) => {
          const c = new window.google.maps.Circle({
            center: pt,
            radius: detourM,
            fillColor: '#C3583C',
            fillOpacity: 0.12,
            strokeColor: '#C3583C',
            strokeOpacity: 0.4,
            strokeWeight: 2,
            clickable: false,
          });
          c.setMap(map);
          circlesRef.current.push(c);
        });
      }
    }
  }, [onWaypointClick]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    redrawOverlays(map, origin, destination, path, waypoints, maxDetourKm, onWaypointClick);
  }, [origin, destination, path, waypoints, maxDetourKm, onWaypointClick, redrawOverlays]);

  const onMapUnmount = useCallback(() => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];
    mapRef.current = null;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    redrawOverlays(map, origin, destination, path, waypoints, maxDetourKm, onWaypointClick);
  }, [origin, destination, path, waypoints, maxDetourKm, onWaypointClick, redrawOverlays]);

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
