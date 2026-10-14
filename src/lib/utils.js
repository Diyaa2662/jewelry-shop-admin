import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price) {
  return `$${price.toLocaleString()}`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
