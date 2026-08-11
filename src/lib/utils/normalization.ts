/**
 * Normalizes email addresses for matching & duplicate detection.
 * Example: " John.Doe+spam@Gmail.com " -> "johndoe@gmail.com"
 */
export function normalizeEmail(email: string): string {
  if (!email) return '';
  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split('@');
  if (parts.length !== 2) return trimmed;

  let [local, domain] = parts;
  // Remove plus addressing e.g. user+tag -> user
  local = local.split('+')[0];
  // Remove dots in local part for gmail/standard providers
  if (['gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com'].includes(domain)) {
    local = local.replace(/\./g, '');
  }

  return `${local}@${domain}`;
}

/**
 * Normalizes company domains.
 * Example: " https://WWW.AcmeCorp.com/about " -> "acmecorp.com"
 */
export function normalizeDomain(domain: string): string {
  if (!domain) return '';
  let cleaned = domain.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, '');
  cleaned = cleaned.replace(/^www\./, '');
  cleaned = cleaned.split('/')[0];
  cleaned = cleaned.split('?')[0];
  return cleaned;
}

/**
 * Format currency amounts nicely.
 */
export function formatCurrency(amount: number | string | null | undefined, currency = 'USD'): string {
  if (amount === null || amount === undefined || amount === '') return '$0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Format dates.
 */
export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'N/A';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return 'N/A';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

/**
 * Check if a date string or Date is overdue (before today's date in local time).
 */
export function isOverdue(dueDateInput: string | Date | null | undefined, isCompleted = false): boolean {
  if (!dueDateInput || isCompleted) return false;
  const due = typeof dueDateInput === 'string' ? new Date(dueDateInput) : dueDateInput;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}
