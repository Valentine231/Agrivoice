export type ProductCategory = "cashCrop" | "perishable" | "grain" | "livestock" | "tuber";

export interface TransportOption {
  id: string;
  name: string;
  description: string;
  vehicle: string;
  bestFor: ProductCategory[];
  etaHoursPerMinDistance: number; // rough hours per 100km
  pricePerKm: number; // naira per km, rough estimate
  refrigerated: boolean;
}

// Baseline fleet catalogue. In production this would come from a transporter
// partner API / database, filtered by live availability near the pickup point.
export const TRANSPORT_FLEET: TransportOption[] = [
  {
    id: "mini-van",
    name: "Mini Van",
    description: "Best for small loads moving within the same state.",
    vehicle: "Van (up to 1 ton)",
    bestFor: ["perishable", "cashCrop", "tuber"],
    etaHoursPerMinDistance: 2.5,
    pricePerKm: 150,
    refrigerated: false,
  },
  {
    id: "refrigerated-van",
    name: "Cold Van",
    description: "Keeps perishable produce fresh over longer trips.",
    vehicle: "Refrigerated Van (1–2 tons)",
    bestFor: ["perishable"],
    etaHoursPerMinDistance: 2.5,
    pricePerKm: 260,
    refrigerated: true,
  },
  {
    id: "flatbed-truck",
    name: "Flatbed Truck",
    description: "Good for bagged grains, tubers, and cash crops in bulk.",
    vehicle: "Truck (3–7 tons)",
    bestFor: ["grain", "cashCrop", "tuber"],
    etaHoursPerMinDistance: 2,
    pricePerKm: 320,
    refrigerated: false,
  },
  {
    id: "livestock-truck",
    name: "Livestock Truck",
    description: "Ventilated truck built for transporting animals safely.",
    vehicle: "Truck with crates",
    bestFor: ["livestock"],
    etaHoursPerMinDistance: 2,
    pricePerKm: 350,
    refrigerated: false,
  },
  {
    id: "trailer",
    name: "Heavy Trailer",
    description: "For large bulk orders travelling across states.",
    vehicle: "Trailer (10+ tons)",
    bestFor: ["grain", "cashCrop"],
    etaHoursPerMinDistance: 1.8,
    pricePerKm: 480,
    refrigerated: false,
  },
];

export interface TransportSuggestion extends TransportOption {
  estimatedCostNaira: number;
  estimatedEtaHours: number;
}

/**
 * Suggests transport options ranked by fit for the given product category and distance.
 * distanceKm should come from a maps/geocoding lookup between farmer and buyer locations —
 * this function only handles the ranking + pricing logic.
 */
export function suggestTransport(
  category: ProductCategory,
  distanceKm: number
): TransportSuggestion[] {
  const scored = TRANSPORT_FLEET.map((opt) => {
    const fits = opt.bestFor.includes(category);
    const estimatedCostNaira = Math.round(opt.pricePerKm * distanceKm + 5000); // + base dispatch fee
    const estimatedEtaHours = Math.round((distanceKm / 100) * opt.etaHoursPerMinDistance * 10) / 10;
    return { ...opt, fits, estimatedCostNaira, estimatedEtaHours };
  });

  return scored
    .sort((a, b) => Number(b.fits) - Number(a.fits) || a.estimatedCostNaira - b.estimatedCostNaira)
    .map(({ fits, ...rest }) => rest);
}

// Rough straight-line distance estimate between two lat/lng points (Haversine).
// Swap for a real routing API (Google Distance Matrix / Mapbox) in production
// for accurate road distance.
export function haversineDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}
