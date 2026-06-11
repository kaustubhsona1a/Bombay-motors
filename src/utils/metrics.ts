/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DatabaseMetrics {
  reads: number;
  writes: number;
}

const METRICS_KEY = 'bombay_motors_db_metrics_v2';

const getInitialMetrics = (): DatabaseMetrics => {
  try {
    const saved = localStorage.getItem(METRICS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.reads === 'number' && typeof parsed.writes === 'number') {
        return parsed;
      }
    }
  } catch (_) {}
  return { reads: 0, writes: 0 };
};

let currentMetrics = getInitialMetrics();
const listeners = new Set<(metrics: DatabaseMetrics) => void>();

export const getMetrics = (): DatabaseMetrics => {
  return { ...currentMetrics };
};

export const incrementReads = (count: number = 1) => {
  currentMetrics.reads += count;
  saveAndNotify();
};

export const incrementWrites = (count: number = 1) => {
  currentMetrics.writes += count;
  saveAndNotify();
};

export const resetMetrics = () => {
  currentMetrics = { reads: 0, writes: 0 };
  saveAndNotify();
};

export const subscribeToMetrics = (listener: (metrics: DatabaseMetrics) => void) => {
  listeners.add(listener);
  listener({ ...currentMetrics });
  return () => {
    listeners.delete(listener);
  };
};

const saveAndNotify = () => {
  try {
    localStorage.setItem(METRICS_KEY, JSON.stringify(currentMetrics));
  } catch (_) {}
  listeners.forEach(l => l({ ...currentMetrics }));
};
