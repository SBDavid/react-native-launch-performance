/**
 * @format
 */

import LaunchPerformance from '@xmly/react-native-launch-performance';
import { addPlugin } from 'react-native-flipper';
LaunchPerformance.loadPlugin(addPlugin);

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
