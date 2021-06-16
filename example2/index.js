/**
 * @format
 */

import LaunchPerformance from '@xmly/react-native-launch-performance';
// import { addPlugin } from 'react-native-flipper';
// LaunchPerformance.loadPlugin(addPlugin);

const observer = new LaunchPerformance.PerformanceObserver(LaunchPerformance.performance, (entry) => {
  console.info(entry.name, entry.detail, entry.duration, entry.startTime);
  if (entry.name.indexOf("contentAppeared") !== -1) {
    const measures = LaunchPerformance.markListener.getJsModuleMeasure();
    console.info(measures[0]);
  }
});

observer.observe({
  types: ['mark']
});

LaunchPerformance.markListener.listenForReactNativeMarker();
LaunchPerformance.markListener.getMeasure();

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
