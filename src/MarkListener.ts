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

  // 作废，脚本启动阶段无法执行脚本内容，需要先执行完所有的require
  listenForJsModuleRequire() {
    /* eslint-disable no-undef */
    // @ts-ignore
    __r.Systrace.beginEvent = this._jsModuleInitStartListener.bind(this);
    // @ts-ignore
    __r.Systrace.endEvent = this._jsModuleInitEndListener.bind(this);
  }

  // 处理原生模块的加载，以及RN框架的启动
  _reactNativeMarkListener(events: ReactNativeMarkEvent[]) {
    events.forEach((event) => {
      // 重置开始时间的偏移量
      if (event.name === 'initTime') {
        p.performance.timeOrigin = event.timestamp;
      }

      // 插入mark
      p.performance.markStartTime(event.name, event.timestamp, event.tag);
    });
  }

  // 作废，处理js模块加载、解释、执行的开始时间
  _jsModuleInitStartListener(event: string) {
    if (event && event.indexOf('JS_require_') !== -1) {
      console.info('_jsModuleInitStartListener', event);
      p.performance.markStartTime(event + 'Start', Date.now(), event);
    }
  }

  // 作废，处理js模块加载、解释、执行的结束时间
  _jsModuleInitEndListener(event: string) {
    if (event && event.indexOf('JS_require_') !== -1) {
      console.info('_jsModuleInitEndListener', event);
      p.performance.markStartTime(event + 'End', Date.now(), event);
    }
  }

  // 获取测量值，更具mark标记生成measure
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

  // 获取jsModule相关数据，更具mark标记生成measure
  getJsModuleMeasure() {
    // TODO:清楚之前的数据
    // @ts-ignore
    const modules = __r.getModules();
    const moduleIds = Object.keys(modules);

    // 发送start和end的mark标记
    moduleIds
      .filter((moduleId) => modules[moduleId].isInitialized)
      .forEach((moduleId) => {
        const module = modules[moduleId];
        if (module.beginTime && module.endTime) {
          const name = 'JS_require_' + (module.verboseName || moduleId);
          p.performance.markStartTime(name + 'Start', module.beginTime);
          p.performance.markStartTime(name + 'End', module.endTime);
        }
      });
    // 发送measure标记
    p.performance.getEntriesByType('mark').forEach((entry) => {
      if (
        entry.name.indexOf('End') !== -1 &&
        entry.name.indexOf('JS_require_') !== -1
      ) {
        const indexOfEnd = entry.name.indexOf('End');
        if (indexOfEnd !== -1 && indexOfEnd === entry.name.length - 3) {
          const measureName = entry.name.substr(0, indexOfEnd);
          p.performance.measure(
            measureName,
            measureName + 'Start',
            measureName + 'End'
          );
        }
      }
    });
  }
}

export const markListener = new MarkListener();
