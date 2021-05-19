import performance from './performance';
import { markListener } from './MarkListener';
import { JsModulePrinter } from './JsModulePrinter';
import { loadPlugin } from './FlipperPluginReporter';

export default {
  performance: performance.performance,
  PerformanceObserver: performance.PerformanceObserver,
  markListener,
  JsModulePrinter,
  loadPlugin,
};
