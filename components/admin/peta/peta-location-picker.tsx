"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createCustomDropPinIcon } from "@/components/public/peta/peta-marker-icon";

const MAP_CONFIG = {
  center: [0.4561266992562788, 117.5132045097694] as [number, number],
  zoom: 15,
  minZoom: 14,
  maxZoom: 18,
  bounds: {
    southWest: [0.4408812282836209, 117.49243117098297] as [number, number],
    northEast: [0.47498595200414906, 117.5224651278459] as [number, number],
  },
};

interface PetaLocationPickerProps {
  latitude: string;
  longitude: string;
  onChange: (lat: string, lng: string) => void;
}

export function PetaLocationPicker({ latitude, longitude, onChange }: PetaLocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const dropPinRef = useRef<L.Marker | null>(null);
  const isUpdatingRef = useRef(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const bounds = L.latLngBounds(
      MAP_CONFIG.bounds.southWest,
      MAP_CONFIG.bounds.northEast
    );

    const initialLat = parseFloat(latitude) || MAP_CONFIG.center[0];
    const initialLng = parseFloat(longitude) || MAP_CONFIG.center[1];

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: MAP_CONFIG.zoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      maxBounds: bounds.pad(0.1),
      maxBoundsViscosity: 1.0,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map);

    mapRef.current = map;

    // Handle map click
    map.on("click", (e) => {
      const latLng = e.latlng;
      
      if (!dropPinRef.current) {
        dropPinRef.current = L.marker(latLng, {
          icon: createCustomDropPinIcon(),
        }).addTo(map);
      } else {
        dropPinRef.current.setLatLng(latLng);
      }
      
      isUpdatingRef.current = true;
      onChange(latLng.lat.toFixed(6), latLng.lng.toFixed(6));
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Sync marker when latitude/longitude props change (e.g., from manual input or initial render)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (isUpdatingRef.current) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      const newLatLng = new L.LatLng(lat, lng);
      
      if (!dropPinRef.current) {
        dropPinRef.current = L.marker(newLatLng, {
          icon: createCustomDropPinIcon(),
        }).addTo(map);
        map.setView(newLatLng);
      } else {
        const currentLatLng = dropPinRef.current.getLatLng();
        if (currentLatLng.lat !== lat || currentLatLng.lng !== lng) {
          dropPinRef.current.setLatLng(newLatLng);
          map.setView(newLatLng);
        }
      }
    } else if (dropPinRef.current) {
       dropPinRef.current.remove();
       dropPinRef.current = null;
    }
  }, [latitude, longitude]);

  return (
    <>
      <div className="relative w-full h-[320px] rounded-md border border-slate-200 overflow-hidden shadow-sm z-0">
        <div
          ref={mapContainerRef}
          className="absolute inset-0"
        />
        <div className="absolute top-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm border border-slate-200 text-xs font-medium text-slate-700 pointer-events-none">
          Klik pada peta untuk menaruh pin
        </div>
      </div>
      <style jsx global>{`
        .custom-marker-icon {
          background: none !important;
          border: none !important;
        }
        .leaflet-control-zoom a {
          width: 30px !important;
          height: 30px !important;
          line-height: 30px !important;
          font-size: 16px !important;
          border-radius: 6px !important;
          background: white !important;
          color: #334155 !important;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12) !important;
          border: none !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f1f5f9 !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          border-radius: 6px !important;
          overflow: hidden;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </>
  );
}
