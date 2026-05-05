export type ProvinceLocation = {
  province: string;
  latitude: number;
  longitude: number;
};

export const PANAMA_PROVINCE_LOCATIONS: ProvinceLocation[] = [
  { province: "Bocas del Toro", latitude: 9.34, longitude: -82.24 },
  { province: "Coclé", latitude: 8.51, longitude: -80.36 },
  { province: "Colón", latitude: 9.35, longitude: -79.9 },
  { province: "Chiriquí", latitude: 8.43, longitude: -82.43 },
  { province: "Darién", latitude: 7.89, longitude: -77.77 },
  { province: "Herrera", latitude: 7.84, longitude: -80.72 },
  { province: "Los Santos", latitude: 7.59, longitude: -80.36 },
  { province: "Panamá", latitude: 8.98, longitude: -79.52 },
  { province: "Panamá Oeste", latitude: 8.88, longitude: -79.78 },
  { province: "Veraguas", latitude: 8.1, longitude: -80.98 },
  { province: "Guna Yala", latitude: 9.45, longitude: -78.98 },
  { province: "Emberá-Wounaan", latitude: 8.38, longitude: -77.65 },
  { province: "Ngäbe-Buglé", latitude: 8.71, longitude: -81.74 },
  { province: "Naso Tjër Di", latitude: 9.18, longitude: -82.68 }
];

export function distanceKm(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) {
  const radius = 6371;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const deltaLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const deltaLng = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestProvince(latitude: number, longitude: number) {
  return PANAMA_PROVINCE_LOCATIONS.reduce(
    (nearest, province) => {
      const distance = distanceKm({ latitude, longitude }, province);
      return distance < nearest.distance ? { province: province.province, distance } : nearest;
    },
    { province: "Panamá", distance: Number.POSITIVE_INFINITY }
  );
}
