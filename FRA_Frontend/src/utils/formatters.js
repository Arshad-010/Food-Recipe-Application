/**
 * Convert total minutes into human-readable format
 * e.g., 45 -> "45 min", 75 -> "1 hr 15 min"
 */
export const formatCookingTime = (minutes) => {
  if (!minutes || minutes <= 0) return 'Quick';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs} hr ${mins} min`;
  if (hrs > 0) return `${hrs} hr`;
  return `${mins} min`;
};

/**
 * Format date into clean short form
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format decimal quantities to readable fractions when applicable
 */
export const formatQuantity = (qty) => {
  if (qty === null || qty === undefined || qty === '') return '';
  const num = Number(qty);
  if (isNaN(num)) return String(qty);

  const rounded = Math.round(num * 100) / 100;
  if (rounded === 0.25) return '¼';
  if (rounded === 0.33 || rounded === 0.333) return '⅓';
  if (rounded === 0.5) return '½';
  if (rounded === 0.66 || rounded === 0.667) return '⅔';
  if (rounded === 0.75) return '¾';
  if (rounded % 1 === 0) return String(rounded);
  return String(rounded);
};

/**
 * Copy text to clipboard with fallback
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch {
    return false;
  }
};
