import { difference, now } from '@/shared/dateUtils';

/**
 * Returns the last updated time if within 24 hours.
 *
 * @param {String} item - The local storage item
 * @returns The last updated time in hours
 */
export function qbStorageLastUpdated(item) {
  try {
    let data = JSON.parse(localStorage.getItem(item));
    let diff = difference(now(), data.lastUpdated, 'hour');
    return data && diff < 24 ? diff : null;
  } catch (err) {
    return null;
  }
} // qbStorageLastUpdated
