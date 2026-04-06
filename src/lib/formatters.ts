import { format, formatDistanceToNow } from 'date-fns'
import type { LTVTier } from './status'

export const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const pct = (n: number) =>
  `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

export const relativeTime = (iso: string) => {
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 36e5);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};


export function formatCurrency(amount: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`
    return `$${amount.toFixed(0)}`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return format(new Date(dateStr), 'MMM d, yyyy')
}

export function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

export const LTV_TIER_LABELS: Record<LTVTier, string> = {
  whale: 'Whale ($10K+)',
  high: 'High ($2.5K+)',
  mid: 'Mid ($500+)',
  low: 'Low (<$500)',
}

export const LTV_TIER_COLORS: Record<LTVTier, string> = {
  whale: 'text-purple-700 bg-purple-100',
  high: 'text-blue-700 bg-blue-100',
  mid: 'text-green-700 bg-green-100',
  low: 'text-zinc-600 bg-zinc-100',
}
