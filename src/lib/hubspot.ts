const BASE = "https://api.hubapi.com";

const headers = {
  Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
  "Content-Type": "application/json",
};

// Generic CRM search
export async function searchCRM(objectType: string, body: object) {
  const res = await fetch(`${BASE}/crm/v3/objects/${objectType}/search`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    next: { revalidate: 300 }, // 5-min edge cache
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HubSpot ${res.status} on ${objectType}: ${body}`);
  }
  return res.json();
}

// Get all owners (reps)
export async function getOwners() {
  const res = await fetch(`${BASE}/crm/v3/owners`, { headers, next: { revalidate: 3600 } });
  return res.json();
}

// Rep lookup map by owner ID
export const REP_MAP: Record<string, string> = {
  "5752313":   "Klarizz Ann Escandor",
  "79698469":  "Michelle Salcedo",
  "80321522":  "Vicky Totanes",
  "81132337":  "Roby Casitas",
  "82733076":  "Marie Balcueva",
  "1779024245":"Giorgina Guevarra",
};
