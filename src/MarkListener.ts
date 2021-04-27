import p from './performance';
import { NativeEventEmitter } from 'react-native';
import type EventEmitter from 'eventemitter3';

interface ReactNativeMarkEvent {
  name: string;
  tag: string;
  timestamp: number;
}

// 监听native, metro, http 发送的mark标记并测量时长
export default class MarkListener {
  _eventEmitter: NativeEventEmitter | null;

  constructor() {
    this._eventEmitter = null;
  }

  // test
  listenForTestMarker(emitter: EventEmitter) {
    emitter.on('react-native-mark', this._reactNativeMarkListener.bind(this));
  }

  listenForReactNativeMarker() {
    if (!this._eventEmitter) this._eventEmitter = new NativeEventEmitter();
    this._eventEmitter.addListener(
      'react-native-mark',
      this._reactNativeMarkListener.bind(this)
    );
  }

  _reactNativeMarkListener(event: ReactNativeMarkEvent) {
    // 重置开始时间的偏移量
    if (event.name === 'initTime') {
      p.performance.timeOrigin = event.timestamp;
    }

    // 插入mark
    p.performance.markStartTime(event.name, event.timestamp, event.tag);
  }

  // 获取测量值
  getMeasure() {
    p.performance.getEntriesByType('mark').forEach((entry) => {
      if (entry.name.indexOf('End') !== -1) {
        // 如果接收到 End 类的 mark，则插入 measure
        const indexOfEnd = entry.name.indexOf('End');
        if (indexOfEnd !== -1 && indexOfEnd === entry.name.length - 3) {
          const measureName = entry.name.substr(0, indexOfEnd);
          p.performance.measure(
            measureName,
            measureName + 'Start',
            measureName + 'End'
          );
        }
      } else if (entry.name.indexOf('Stop') !== -1) {
        // 如果接收到 End 类的 mark，则插入 measure
        const indexOfEnd = entry.name.indexOf('Stop');
        if (indexOfEnd !== -1 && indexOfEnd === entry.name.length - 4) {
          const measureName = entry.name.substr(0, indexOfEnd);
          p.performance.measure(
            measureName,
            measureName + 'Start',
            measureName + 'Stop'
          );
        }
      }
    });
  }
}

export const markListener = new MarkListener();
