import L from "leaflet";
import { getCategoryConfig, CATEGORY_MAP } from "@/constants/peta";

export function createMarkerIcon(kategori: string, warnaPin?: string): L.DivIcon {
  const isDefaultCategory = !!CATEGORY_MAP[kategori];
  const config = getCategoryConfig(kategori);
  
  // Gunakan custom warnaPin jika kategori custom dan warnaPin diberikan
  const finalColor = (!isDefaultCategory && warnaPin) ? warnaPin : config.color;

  const html = `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
    ">
      <div style="
        width: 36px;
        height: 36px;
        background: ${finalColor};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" style="transform: rotate(45deg);">
          ${config.iconSvg}
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-marker-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

export function createCustomDropPinIcon(): L.DivIcon {
  const html = `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
    ">
      <div style="
        width: 36px;
        height: 36px;
        background: #475569;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" style="transform: rotate(45deg);">
          <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-marker-icon drop-pin-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}
