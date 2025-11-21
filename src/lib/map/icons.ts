/**
 * Custom Leaflet marker icons for different event types
 *
 * Creates colored marker icons that match the event type colors
 * used throughout the application for visual consistency.
 */

import L from 'leaflet';
import { EventType } from '@/types/event';

/**
 * Event type colors matching the design system
 */
export const eventColors: Record<EventType, string> = {
  FLIGHT: '#2563eb',        // blue-600
  HOTEL: '#9333ea',         // purple-600
  ACTIVITY: '#16a34a',      // green-600
  RESTAURANT: '#ea580c',    // orange-600
  TRANSPORTATION: '#4f46e5', // indigo-600
  DESTINATION: '#dc2626',   // red-600
};

/**
 * Event type icons (emoji/unicode)
 */
export const eventIcons: Record<EventType, string> = {
  FLIGHT: '✈️',
  HOTEL: '🏨',
  ACTIVITY: '🎯',
  RESTAURANT: '🍽️',
  TRANSPORTATION: '🚗',
  DESTINATION: '📍',
};

/**
 * Create an SVG marker icon for a specific event type
 *
 * @param type - The event type
 * @returns Leaflet DivIcon with colored SVG marker
 */
export function createEventIcon(type: EventType): L.DivIcon {
  const color = eventColors[type];
  const icon = eventIcons[type];

  const svgIcon = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <!-- Drop shadow -->
      <ellipse cx="16" cy="39" rx="8" ry="2" fill="rgba(0,0,0,0.2)" />

      <!-- Marker pin -->
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z"
            fill="${color}"
            stroke="white"
            stroke-width="2"/>

      <!-- Icon background circle -->
      <circle cx="16" cy="16" r="8" fill="white" />

      <!-- Icon text -->
      <text x="16" y="16"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="12"
            fill="${color}">${icon}</text>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker-icon',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
}

/**
 * Create a cluster icon for multiple markers
 *
 * @param cluster - Leaflet marker cluster
 * @returns HTML string for cluster icon
 */
export function createClusterIcon(cluster: any): L.DivIcon {
  const count = cluster.getChildCount();

  // Size based on count
  let size = 40;
  let className = 'marker-cluster-small';

  if (count >= 100) {
    size = 56;
    className = 'marker-cluster-large';
  } else if (count >= 10) {
    size = 48;
    className = 'marker-cluster-medium';
  }

  return L.divIcon({
    html: `<div class="cluster-inner"><span>${count}</span></div>`,
    className: `marker-cluster ${className}`,
    iconSize: [size, size],
  });
}

/**
 * Default marker icon (for events without type)
 */
export const defaultIcon = L.divIcon({
  html: `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="39" rx="8" ry="2" fill="rgba(0,0,0,0.2)" />
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z"
            fill="#64748b"
            stroke="white"
            stroke-width="2"/>
      <circle cx="16" cy="16" r="8" fill="white" />
      <text x="16" y="16"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="12"
            fill="#64748b">📌</text>
    </svg>
  `,
  className: 'custom-marker-icon',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
});
