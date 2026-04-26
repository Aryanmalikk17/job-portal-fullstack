/**
 * Centralized date utility for formatting dates across the application.
 * Handles various date formats and provides fallbacks for invalid or missing dates.
 */

/**
 * Formats a date string or object into a human-readable format.
 * Default format: 'Oct 26, 2023'
 * 
 * @param {string|Date|null} dateValue - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateValue, options = {}) => {
  if (!dateValue) return 'N/A';
  
  try {
    const date = new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return date.toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error';
  }
};

/**
 * Returns a relative time string (e.g., "2 days ago")
 * 
 * @param {string|Date} dateValue - The date to compare
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateValue) => {
  if (!dateValue) return 'N/A';
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatDate(date);
  } catch (error) {
    return formatDate(dateValue);
  }
};
