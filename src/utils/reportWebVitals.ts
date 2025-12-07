import { Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

/**
 * Reports Web Vitals metrics to the console and can be extended to send to analytics
 *
 * Core Web Vitals:
 * - LCP (Largest Contentful Paint): Loading performance (should be < 2.5s)
 * - INP (Interaction to Next Paint): Interactivity (should be < 200ms)
 * - CLS (Cumulative Layout Shift): Visual stability (should be < 0.1)
 *
 * Other metrics:
 * - FCP (First Contentful Paint): Time to first render (should be < 1.8s)
 * - TTFB (Time to First Byte): Server response time (should be < 600ms)
 */

const reportMetric = (metric: Metric) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // You can send to analytics service here
  // Example: sendToAnalytics(metric);
};

export const reportWebVitals = () => {
  onCLS(reportMetric);
  onFCP(reportMetric);
  onINP(reportMetric);
  onLCP(reportMetric);
  onTTFB(reportMetric);
};
