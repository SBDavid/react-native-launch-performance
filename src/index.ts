import performance from './performance';
import { markListener } from './MarkListener';

export default {
  performance: performance.performance,
  PerformanceObserver: performance.PerformanceObserver,
  markListener,
};
