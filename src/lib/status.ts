import { differenceInDays } from "date-fns";

export type CustomerStatus =
  | "New"
  | "Active"
  | "Reactivation"
  | "Fading"
  | "NewChurn"
  | "Inactive";

export function getCustomerStatus(lastOrderDate: string | null): CustomerStatus {
  if (!lastOrderDate) return "Inactive";
  const days = differenceInDays(new Date(), new Date(lastOrderDate));
  if (days < 0)    return "Active";
  if (days <= 90)  return "Active";
  if (days <= 119) return "Fading";
  if (days <= 150) return "NewChurn";
  return "Inactive";
}

export type LTVTier = "whale" | "high" | "mid" | "low";

export function getLtvTier(ltv: number): LTVTier {
  if (ltv >= 10000) return "whale";
  if (ltv >= 2500)  return "high";
  if (ltv >= 500)   return "mid";
  return "low";
}

export function isApproachingChurn(lastOrderDate: string | null): boolean {
  if (!lastOrderDate) return false;
  const days = differenceInDays(new Date(), new Date(lastOrderDate));
  return days >= 115 && days <= 119;
}

export function isWhaleAtRisk(lastOrderDate: string | null): boolean {
  if (!lastOrderDate) return false;
  return differenceInDays(new Date(), new Date(lastOrderDate)) >= 30;
}

export const STATUS_LABEL: Record<CustomerStatus, string> = {
  New:          "New",
  Active:       "Active",
  Reactivation: "Reactivation",
  Fading:       "Fading",
  NewChurn:     "New Churn",
  Inactive:     "Inactive",
};

export const STATUS_COLOR: Record<CustomerStatus, string> = {
  New:          "bg-green-100 text-green-800",
  Active:       "bg-blue-100 text-blue-800",
  Reactivation: "bg-purple-100 text-purple-800",
  Fading:       "bg-yellow-100 text-yellow-800",
  NewChurn:     "bg-orange-100 text-orange-800",
  Inactive:     "bg-gray-100 text-gray-700",
};
