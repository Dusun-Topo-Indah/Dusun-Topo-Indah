"use client";

import type { FasilitasRow } from "@/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { createMarkerIcon, getCategoryConfig } from "./peta-marker-icon";

// Map configuration
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

interface PetaMapViewProps {
  fasilitas: FasilitasRow[];
  selectedId: string | null;
  onMarkerClick: (id: string) => void;
}

export function PetaMapView({ fasilitas, selectedId, onMarkerClick }: PetaMapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const bounds = L.latLngBounds(
      MAP_CONFIG.bounds.southWest,
      MAP_CONFIG.bounds.northEast
    );

    const map = L.map(mapContainerRef.current, {
      center: MAP_CONFIG.center,
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

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Manage markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    fasilitas.forEach((item) => {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const icon = createMarkerIcon(item.kategori_ikon);
      const config = getCategoryConfig(item.kategori_ikon);

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      const popupContent = `
        <div style="min-width: 220px; max-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
          ${
            item.url_foto
              ? `<img src="${item.url_foto}" alt="${item.nama_fasum}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px 8px 0 0; margin: -14px -14px 10px -14px; width: calc(100% + 28px);" />`
              : ""
          }
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="
              display: inline-block;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: ${config.color};
              flex-shrink: 0;
            "></span>
            <span style="font-size: 11px; color: #64748b; font-weight: 500;">${config.label}</span>
          </div>
          <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.3;">${item.nama_fasum}</h3>
          ${
            item.deskripsi
              ? `<p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">${item.deskripsi}</p>`
              : ""
          }
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        className: "custom-popup",
      });

      marker.on("click", () => {
        onMarkerClick(item.id);
      });

      markersRef.current.set(item.id, marker);
    });
  }, [fasilitas, onMarkerClick]);

  // Fly to selected marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const marker = markersRef.current.get(selectedId);
    if (marker) {
      const latLng = marker.getLatLng();
      map.flyTo(latLng, 17, { duration: 0.8 });
      setTimeout(() => {
        marker.openPopup();
      }, 900);
    }
  }, [selectedId]);

  return (
    <>
      <div
        ref={mapContainerRef}
        className="absolute inset-0 z-0"
        id="peta-map-container"
      />
      <style jsx global>{`
        .custom-marker-icon {
          background: none !important;
          border: none !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          padding: 0;
          overflow: hidden;
        }
        .custom-popup .leaflet-popup-content {
          margin: 14px;
        }
        .custom-popup .leaflet-popup-tip {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .leaflet-control-zoom a {
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
          border-radius: 8px !important;
          background: white !important;
          color: #334155 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12) !important;
          border: none !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f1f5f9 !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          border-radius: 10px !important;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </>
  );
}
