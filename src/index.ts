import performance from './performance';
import { markListener } from './MarkListener';
import { JsModulePrinter } from './JsModulePrinter';

export default {
  performance: performance.performance,
  PerformanceObserver: performance.PerformanceObserver,
  markListener,
  JsModulePrinter,
};
