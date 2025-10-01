// Performance monitoring utility - simplified version
// TODO: Install web-vitals package for full Core Web Vitals support

interface PerformanceReport {
  id: string;
  name: string;
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent: string;
}

interface MetricData {
  id: string;
  name: string;
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

class PerformanceMonitor {
  private reports: PerformanceReport[] = [];
  private reportEndpoint = '/api/analytics/performance';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMetrics();
    }
  }

  private initializeMetrics() {
    // Basic performance tracking using native APIs
    this.trackNavigationTiming();
    this.trackResourceTiming();

    // Send batch report when page unloads
    window.addEventListener('beforeunload', () => {
      this.sendBatch();
    });

    // Send batch report every 30 seconds
    setInterval(() => {
      this.sendBatch();
    }, 30000);
  }

  private trackNavigationTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigation) {
        // First Contentful Paint approximation
        const fcp = navigation.responseEnd - navigation.fetchStart;
        this.handleMetric({
          id: 'fcp-' + Date.now(),
          name: 'FCP',
          value: fcp,
          delta: fcp,
          rating: fcp < 1800 ? 'good' : fcp < 3000 ? 'needs-improvement' : 'poor'
        });

        // Time to First Byte
        const ttfb = navigation.responseStart - navigation.requestStart;
        this.handleMetric({
          id: 'ttfb-' + Date.now(),
          name: 'TTFB',
          value: ttfb,
          delta: ttfb,
          rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor'
        });
      }
    }
  }

  private trackResourceTiming() {
    if ('performance' in window) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const totalResourceTime = resources.reduce((sum, resource) => {
        return sum + (resource.responseEnd - resource.fetchStart);
      }, 0);

      this.handleMetric({
        id: 'resource-load-' + Date.now(),
        name: 'ResourceLoad',
        value: totalResourceTime,
        delta: totalResourceTime,
        rating: totalResourceTime < 2000 ? 'good' : totalResourceTime < 4000 ? 'needs-improvement' : 'poor'
      });
    }
  }

  private handleMetric(metric: MetricData) {
    const report: PerformanceReport = {
      id: metric.id,
      name: metric.name,
      value: Math.round(metric.value),
      delta: Math.round(metric.delta),
      rating: metric.rating,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.reports.push(report);

    // Log to console in development (disabled to reduce noise)
    // if (process.env.NODE_ENV === 'development') {
    //   console.log(`${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`);
    // }

    // Send critical metrics immediately
    if (report.rating === 'poor') {
      this.sendReport(report);
    }
  }

  private sendReport(report: PerformanceReport) {
    // Disable in development to avoid 404 errors
    if (process.env.NODE_ENV === 'production' && navigator.sendBeacon) {
      navigator.sendBeacon(
        this.reportEndpoint,
        JSON.stringify(report)
      );
    }
  }

  private sendBatch() {
    if (this.reports.length === 0) return;

    const batch = [...this.reports];
    this.reports = [];

    // Disable in development to avoid 404 errors
    if (process.env.NODE_ENV === 'production' && navigator.sendBeacon) {
      navigator.sendBeacon(
        `${this.reportEndpoint}/batch`,
        JSON.stringify(batch)
      );
    }
  }

  // Public method to get current performance data
  getPerformanceData() {
    return {
      reports: [...this.reports],
      summary: this.getSummary(),
    };
  }

  private getSummary() {
    const metrics = ['FCP', 'TTFB', 'ResourceLoad'];
    const summary: Record<string, { value: number; rating: string }> = {};

    metrics.forEach(metric => {
      const metricReports = this.reports.filter(r => r.name === metric);
      if (metricReports.length > 0) {
        const latest = metricReports[metricReports.length - 1];
        summary[metric] = {
          value: latest.value,
          rating: latest.rating,
        };
      }
    });

    return summary;
  }

  // Method to manually track custom metrics
  trackCustomMetric(name: string, value: number) {
    const report: PerformanceReport = {
      id: `custom-${Date.now()}`,
      name: `custom.${name}`,
      value: Math.round(value),
      delta: 0,
      rating: 'good', // Custom metrics default to good
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.reports.push(report);

    if (process.env.NODE_ENV === 'development') {
      console.log(`Custom ${name}: ${Math.round(value)}ms`);
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const trackPageLoad = (pageName: string) => {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      performanceMonitor.trackCustomMetric(`page.${pageName}.load`, loadTime);
    };
  };

  const trackComponentRender = (componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      performanceMonitor.trackCustomMetric(`component.${componentName}.render`, renderTime);
    };
  };

  const trackUserInteraction = (action: string) => {
    const startTime = performance.now();
    
    return () => {
      const interactionTime = performance.now() - startTime;
      performanceMonitor.trackCustomMetric(`interaction.${action}`, interactionTime);
    };
  };

  return {
    trackPageLoad,
    trackComponentRender,
    trackUserInteraction,
    getPerformanceData: () => performanceMonitor.getPerformanceData(),
  };
}