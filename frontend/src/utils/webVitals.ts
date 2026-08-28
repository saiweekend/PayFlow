import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

/**
 * Real User Monitoring (RUM) hook.
 *
 * The job posting lists frontend performance monitoring/optimization as a
 * preferred skill, and Sentry/Kibana/New Relic/GA as the observability
 * stack in use. This module is written so the *transport* is swappable
 * without touching call sites: today it logs and (optionally) beacons to a
 * configurable endpoint; in a real deployment `report()` would forward to
 * whichever RUM ingestion endpoint New Relic Browser or a Sentry
 * `captureMetric`-style call expects.
 */

export interface VitalsReport {
  name: Metric['name'];
  value: number;
  rating: Metric['rating'];
  id: string;
  navigationType: Metric['navigationType'];
}

type Reporter = (report: VitalsReport) => void;

function toReport(metric: Metric): VitalsReport {
  return {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
  };
}

function defaultReporter(report: VitalsReport): void {
  const endpoint = import.meta.env.VITE_VITALS_ENDPOINT as string | undefined;

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[web-vitals]', report.name, report.value.toFixed(2), report.rating);
  }

  if (!endpoint) return;

  // navigator.sendBeacon fires-and-forgets even during page unload, which
  // matters for metrics like CLS/LCP that are often only final right as the
  // user navigates away — a normal fetch() could get cancelled mid-flight.
  const payload = JSON.stringify(report);
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, payload);
  } else {
    fetch(endpoint, { method: 'POST', body: payload, keepalive: true }).catch(() => {
      /* best-effort telemetry; a failed beacon must never affect the user */
    });
  }
}

/** Wires up Core Web Vitals + INP reporting. Call once from main.ts. */
export function initWebVitals(reporter: Reporter = defaultReporter): void {
  onCLS((m) => reporter(toReport(m)));
  onINP((m) => reporter(toReport(m)));
  onLCP((m) => reporter(toReport(m)));
  onFCP((m) => reporter(toReport(m)));
  onTTFB((m) => reporter(toReport(m)));
}
