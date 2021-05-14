/**
 * @format
 */

import LaunchPerformance from 'react-native-launch-performance';

// const observer = new LaunchPerformance.PerformanceObserver(LaunchPerformance.performance, (entry) => {
//   console.info(entry.name, entry.detail, entry.duration, entry.startTime);
// });
// observer.observe({
//   types: ['measure']
// });

setTimeout(() => {
  // LaunchPerformance.markListener.getJsModuleMeasure();
  (new LaunchPerformance.JsModulePrinter()).print();
}, 2000);

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
