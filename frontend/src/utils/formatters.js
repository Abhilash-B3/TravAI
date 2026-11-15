import { ENV } from '../config/env';

export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST) — Asia/Kolkata (UTC+5:30)', shortLabel: 'IST' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST) — Asia/Dubai (UTC+4)', shortLabel: 'GST' },
  { value: 'Asia/Singapore', label: 'Singapore Standard Time (SGT) — Asia/Singapore (UTC+8)', shortLabel: 'SGT' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST) — Asia/Tokyo (UTC+9)', shortLabel: 'JST' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT/BST) — Europe/London (UTC+0/+1)', shortLabel: 'GMT' },
  { value: 'Europe/Paris', label: 'Central European Time (CET) — Europe/Paris (UTC+1)', shortLabel: 'CET' },
  { value: 'America/New_York', label: 'Eastern Time (ET) — America/New_York (UTC-5)', shortLabel: 'EST' },
  { value: 'America/Chicago', label: 'Central Time (CT) — America/Chicago (UTC-6)', shortLabel: 'CST' },
  { value: 'America/Denver', label: 'Mountain Time (MT) — America/Denver (UTC-7)', shortLabel: 'MST' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT) — America/Los_Angeles (UTC-8)', shortLabel: 'PST' },
];

export const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'Indian Rupee (INR — ₹)', symbol: '₹' },
  { value: 'USD', label: 'US Dollar (USD — $)', symbol: '$' },
  { value: 'EUR', label: 'Euro (EUR — €)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (GBP — £)', symbol: '£' },
  { value: 'AED', label: 'UAE Dirham (AED — د.إ)', symbol: 'AED' },
  { value: 'SGD', label: 'Singapore Dollar (SGD — S$)', symbol: 'S$' },
];

/**
 * Format monetary amount with canonical INR symbol (₹) and Indian numbering system (Lakhs/Crores)
 * Defaults to INR / en-IN
 */
export function formatCurrency(amount, currency = 'INR', options = {}) {
  const numericAmount = Number(amount) || 0;
  const targetCurrency = currency || ENV.DEFAULT_CURRENCY || 'INR';
  const locale = targetCurrency === 'INR' ? 'en-IN' : (options.locale || 'en-US');

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: options.minimumFractionDigits !== undefined 
        ? options.minimumFractionDigits 
        : (numericAmount % 1 === 0 ? 0 : 2),
      maximumFractionDigits: options.maximumFractionDigits !== undefined ? options.maximumFractionDigits : 2,
    });
    return formatter.format(numericAmount);
  } catch (err) {
    // Fallback formatting
    const symbol = targetCurrency === 'INR' ? '₹' : (targetCurrency === 'USD' ? '$' : `${targetCurrency} `);
    return `${symbol}${numericAmount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

/**
 * Format compact monetary amount (e.g. ₹1.2L, ₹85K)
 */
export function formatCurrencyCompact(amount, currency = 'INR') {
  const num = Number(amount) || 0;
  const symbol = currency === 'INR' ? '₹' : '$';

  if (currency === 'INR') {
    if (num >= 10000000) return `${symbol}${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `${symbol}${(num / 100000).toFixed(1)} L`;
    if (num >= 1000) return `${symbol}${(num / 1000).toFixed(1)} K`;
    return `${symbol}${num.toFixed(0)}`;
  }

  if (num >= 1000000) return `${symbol}${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${symbol}${(num / 1000).toFixed(1)}K`;
  return `${symbol}${num.toFixed(0)}`;
}

/**
 * Format timestamp in Asia/Kolkata (IST) timezone
 */
export function formatDateTime(dateInput, timeZone = 'Asia/Kolkata', options = {}) {
  if (!dateInput) return '—';
  try {
    const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);

    const targetTz = timeZone || ENV.DEFAULT_TIMEZONE || 'Asia/Kolkata';
    const isIST = targetTz === 'Asia/Kolkata';

    const formatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: targetTz,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      ...options,
    }).format(date);

    return isIST && !options.hideTzSuffix ? `${formatted} IST` : formatted;
  } catch (e) {
    return String(dateInput);
  }
}

/**
 * Format date in localized format (e.g., "12 Oct 2026")
 */
export function formatDate(dateInput, timeZone = 'Asia/Kolkata') {
  if (!dateInput) return '—';
  try {
    const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);

    const targetTz = timeZone || ENV.DEFAULT_TIMEZONE || 'Asia/Kolkata';
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: targetTz,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    return String(dateInput);
  }
}

/**
 * Format time in localized format (e.g., "03:30 PM IST")
 */
export function formatTime(dateInput, timeZone = 'Asia/Kolkata', includeTz = true) {
  if (!dateInput) return '—';
  try {
    const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);

    const targetTz = timeZone || ENV.DEFAULT_TIMEZONE || 'Asia/Kolkata';
    const isIST = targetTz === 'Asia/Kolkata';

    const formatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: targetTz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);

    return includeTz && isIST ? `${formatted} IST` : formatted;
  } catch (e) {
    return String(dateInput);
  }
}
