export const deliveryLocations = [
  { village: "Hlohovec", fee: 0, minimum: 0 },
  { village: "Šulekovo", fee: 2, minimum: 20 },
  { village: "Leopoldov", fee: 2, minimum: 20 },
  { village: "Koplotovce", fee: 3, minimum: 20 },
  { village: "Červeník", fee: 3, minimum: 20 },
  { village: "Bojničky", fee: 3, minimum: 20 },
  { village: "Kľačany", fee: 4, minimum: 20 },
  { village: "Tepličky", fee: 4, minimum: 20 },
  { village: "Dvorníky", fee: 4, minimum: 20 },
  { village: "Otrokovce", fee: 4, minimum: 20 },
  { village: "Trhovište", fee: 4, minimum: 20 },
  { village: "Sasinkovo", fee: 4.5, minimum: 20 }
];

export function deliveryForVillage(village) {
  return deliveryLocations.find((location) => location.village === village) || null;
}

export function money(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

export function validateStreet(street) {
  const clean = String(street || "").trim().replace(/\s+/g, " ");
  if (clean.length < 5) return null;
  if (!/\d/.test(clean)) return null;
  if (/https?:|<|>|\{|\}/i.test(clean)) return null;
  return clean;
}
