import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatTimeAgo(date: Date | string | null): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay > 0) {
    return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
  }
  
  if (diffHour > 0) {
    return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
  }
  
  if (diffMin > 0) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  return 'Just now';
}

export function formatLongDate(date: Date | string | null): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    healthy: 'success',
    available: 'success',
    completed: 'success',
    
    monitoring: 'warning',
    low_supply: 'warning',
    pending: 'warning',
    high: 'warning',
    
    critical: 'error',
    maintenance: 'error',
    cancelled: 'error',
    depleted: 'error',
    
    unclassified: 'neutral',
    normal: 'info',
    routine: 'info',
    info: 'info'
  };
  
  return statusMap[status.toLowerCase()] || 'neutral';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getGeoJSONCenter(coordinates: any): [number, number] {
  // Simple centroid calculation for points
  if (coordinates?.type === 'Point' && Array.isArray(coordinates.coordinates)) {
    return [coordinates.coordinates[1], coordinates.coordinates[0]]; // Convert [lng, lat] to [lat, lng] for Leaflet
  }
  
  // Default center point if coordinates are invalid
  return [45.0, -122.0];
}
