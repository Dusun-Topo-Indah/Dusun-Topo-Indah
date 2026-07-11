export interface CategoryConfig {
  label: string;
  color: string;
  iconSvg: string;
}

export const CATEGORY_MAP: Record<string, CategoryConfig> = {
  Masjid: {
    label: "Masjid",
    color: "#22c55e",
    iconSvg: `<path d="M18 2H6v6h.01L6 12l6 8 6-8-.01-4H18V2zm-6 14.5L8 11h8l-4 5.5zM14 8H10V4h4v4z" fill="white"/>`,
  },
  Musholla: {
    label: "Musholla",
    color: "#10b981",
    iconSvg: `<path d="M18 2H6v6h.01L6 12l6 8 6-8-.01-4H18V2zm-6 14.5L8 11h8l-4 5.5zM14 8H10V4h4v4z" fill="white"/>`,
  },
  Posyandu: {
    label: "Posyandu",
    color: "#ef4444",
    iconSvg: `<path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" fill="white"/>`,
  },
  Wisata: {
    label: "Wisata",
    color: "#f97316",
    iconSvg: `<path d="M6 20h12l-1.2-4H7.2L6 20zM12 2C8.69 2 6 4.69 6 8c0 1.84.83 3.48 2.13 4.6L7.2 16h9.6l-.93-3.4A5.994 5.994 0 0018 8c0-3.31-2.69-6-6-6z" fill="white"/>`,
  },
  Jalan: {
    label: "Jalan",
    color: "#eab308",
    iconSvg: `<path d="M11 2v4H8l4 6 4-6h-3V2h-2zm-2 10H4l1.5 4H9v4h2v-4h2v4h2v-4h3.5L20 12h-5l-3 4-3-4z" fill="white"/>`,
  },
  "Sekolah / Pendidikan": {
    label: "Sekolah / Pendidikan",
    color: "#3b82f6",
    iconSvg: `<path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="white"/>`,
  },
  Gereja: {
    label: "Gereja",
    color: "#6366f1",
    iconSvg: `<path d="M11 2v4H8l2 6v10h4V12l2-6h-3V2h-2z" fill="white"/>`,
  },
};

const DEFAULT_CONFIG: CategoryConfig = {
  label: "Lainnya",
  color: "#8b5cf6",
  iconSvg: `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>`,
};

export function getCategoryConfig(kategori: string): CategoryConfig {
  return CATEGORY_MAP[kategori] || DEFAULT_CONFIG;
}

export function getAllCategories(): string[] {
  return Object.keys(CATEGORY_MAP);
}
