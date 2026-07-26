/**
 * Utility Helper Functions
 * Provides reusable helper functions for the application
 */

import { toast } from 'react-hot-toast';

/**
 * Format currency value
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'INR')
 * @param {string} locale - Locale string for formatting (default: 'en-IN')
 * @returns {string} Formatted currency string
 */
 export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
   if (amount === null || amount === undefined) return '--';
   
   return new Intl.NumberFormat(locale, {
     style: 'currency',
     currency,
  }).format(amount);
};

/**
 * Format date to display format
 * @param {string|Date} date - Date to format
 * @param {string} format - Format string (default: 'MMM DD, YYYY')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'MMM DD, YYYY') => {
  if (!date) return '--';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '--';
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  if (format.includes('HH')) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return d.toLocaleDateString('en-US', options);
};

/**
 * Format date time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date time string
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM DD, YYYY HH:mm');
};

/**
 * Get time ago string
 * @param {string|Date} date - Date to compare
 * @returns {string} Time ago string
 */
export const timeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diff = now - past;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length (default: 50)
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50, suffix = '...') => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + suffix;
};

/**
 * Generate random ID
 * @param {number} length - Length of the ID (default: 8)
 * @returns {string} Random ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds (default: 300)
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds (default: 300)
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Get nested object value by path
 * @param {Object} obj - Object to get value from
 * @param {string} path - Path to the value (e.g., 'user.profile.name')
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Value at path
 */
export const getNestedValue = (obj, path, defaultValue = undefined) => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  return result === undefined ? defaultValue : result;
};

/**
 * Set nested object value by path
 * @param {Object} obj - Object to set value in
 * @param {string} path - Path to the value
 * @param {*} value - Value to set
 * @returns {Object} Updated object
 */
export const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  const result = { ...obj };
  let current = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
  return result;
};

/**
 * Convert object to query string
 * @param {Object} params - Parameters object
 * @returns {string} Query string
 */
export const toQueryString = (params) => {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  }
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Parse query string to object
 * @param {string} queryString - Query string
 * @returns {Object} Parsed object
 */
export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

/**
 * Download file
 * @param {Blob} blob - File blob
 * @param {string} fileName - File name
 */
export const downloadFile = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Copy to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise} Promise
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    toast.error('Failed to copy to clipboard');
    return false;
  }
};

/**
 * Get file extension
 * @param {string} fileName - File name
 * @returns {string} File extension
 */
export const getFileExtension = (fileName) => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

/**
 * Get file size in readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Human readable file size
 */
export const getFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
};

/**
 * Validate phone number
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
  const pattern = /^\+?[\d\s-]{10,15}$/;
  return pattern.test(phone);
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Generate random color
 * @returns {string} Random hex color
 */
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Get avatar color based on name
 * @param {string} name - Name to generate color from
 * @returns {string} Color
 */
export const getAvatarColor = (name) => {
  if (!name) return '#4F46E5';
  const colors = [
    '#4F46E5', '#10B981', '#EF4444', '#F59E0B', '#3B82F6',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Pluralize word
 * @param {number} count - Count
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form (optional)
 * @returns {string} Pluralized word
 */
export const pluralize = (count, singular, plural = null) => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Snake case to title case
 * @param {string} text - Snake case text
 * @returns {string} Title case text
 */
export const snakeToTitle = (text) => {
  if (!text) return '';
  return text
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Generate order number
 * @returns {string} Order number
 */
export const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Generate invoice number
 * @returns {string} Invoice number
 */
export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `INV-${year}${month}${day}-${random}`;
};

/**
 * Get status color
 * @param {string} status - Status string
 * @param {Object} statusMap - Status color mapping
 * @returns {string} Color
 */
export const getStatusColor = (status, statusMap = {}) => {
  const defaultMap = {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    pending: '#F59E0B',
    completed: '#10B981',
    cancelled: '#EF4444',
    active: '#10B981',
    inactive: '#EF4444',
  };
  
  const map = { ...defaultMap, ...statusMap };
  return map[status] || '#6B7280';
};

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order (asc/desc)
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, order = 'asc') => {
  const sorted = [...array];
  sorted.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
};

/**
 * Filter array by search term
 * @param {Array} array - Array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} searchKeys - Keys to search in
 * @returns {Array} Filtered array
 */
export const filterBySearch = (array, searchTerm, searchKeys) => {
  if (!searchTerm) return array;
  const term = searchTerm.toLowerCase();
  return array.filter(item => {
    return searchKeys.some(key => {
      const value = getNestedValue(item, key, '');
      return String(value).toLowerCase().includes(term);
    });
  });
};

/**
 * Get percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number} Percentage
 */
export const getPercentage = (value, total) => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Format percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, total, decimals = 1) => {
  const percentage = getPercentage(value, total);
  return `${percentage.toFixed(decimals)}%`;
};