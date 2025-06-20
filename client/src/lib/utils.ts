import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRating(rating: string | number): string {
  const num = typeof rating === 'string' ? parseFloat(rating) : rating;
  return num.toFixed(1);
}

export function formatReviewCount(count: number): string {
  if (count === 1) return "1 Review";
  return `${count} reviews`;
}

export function renderStars(rating: string | number) {
  const num = typeof rating === 'string' ? parseFloat(rating) : rating;
  const fullStars = Math.floor(num);
  const hasHalfStar = num - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return {
    full: fullStars,
    half: hasHalfStar ? 1 : 0,
    empty: emptyStars
  };
}
