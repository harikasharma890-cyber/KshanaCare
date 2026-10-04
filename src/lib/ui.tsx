import { Star, Clock, BadgeIndianRupee } from 'lucide-react';

export function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={size} className="fill-amber-400 text-amber-400" />
      <span className="font-semibold text-ink-700">{rating.toFixed(1)}</span>
    </div>
  );
}

export function formatFee(fee: number): string {
  return `₹${fee.toLocaleString('en-IN')}`;
}

export { Clock, BadgeIndianRupee };
