import type { Flipper } from 'react-native-flipper';
import p from './performance';
import { markListener } from './MarkListener';
import { JsModulePrinter, PrintOption } from './JsModulePrinter';

export function loadPlugin(addPlugin: Function) {
  // 监听 measure事件
  const _observer = new p.PerformanceObserver(p.performance, (entry) => {
    if (_connectionLog) {
      if (entry.duration >= _minDuration) {
        _connectionLog.send('measure', entry);
      }
    }
  });
  // 监听开始事件
  const _observerStart = new p.PerformanceObserver(p.performance, (entry) => {
    if (_connectionLog) {
      if (entry.name === 'JS_require_start') {
        _connectionLog.send('JS_require_start', entry);
      }
    }
  });
  let _connectionLog: Flipper.FlipperConnection | null;
  let _connectionTree: Flipper.FlipperConnection | null;
  // 最小加载时间
  let _minDuration = 0;

  addPlugin({
    getId() {
      console.info('getId LaunchPerformanceLog');
      return 'LaunchPerformanceLog';
    },
    onConnect: (connection: Flipper.FlipperConnection) => {
      console.info('onConnect LaunchPerformanceLog');
      _connectionLog = connection;
      // 设置最小加载时间
      _connectionLog.receive('setMinDuration', (data: number) => {
        _minDuration = data;
      });
      // 逐条监听 measure 事件
      _observer.observe({
        types: ['measure'],
      });
      _observerStart.observe({
        types: ['mark'],
      });
      // 获取完整的信息
      _connectionLog.receive('getTree', (data: PrintOption, responder) => {
        const printer = new JsModulePrinter();
        responder.success(printer.getJson(data));
      });
      markListener.getJsModuleMeasure();
    },
    onDisconnect: () => {
      console.info('onDisconnect LaunchPerformanceLog');
      _connectionLog = null;
      _observer.disconnect();
      _observerStart.disconnect();
    },
    runInBackground: () => {
      return true;
    },
  });

  addPlugin({
    getId() {
      console.info('getId LaunchPerformanceTree');
      return 'LaunchPerformanceTree';
    },
    onConnect: (connection: Flipper.FlipperConnection) => {
      console.info('onConnect LaunchPerformanceTree');
      _connectionTree = connection;
      // 设置最小加载时间
      _connectionTree.receive('setMinDuration', (data: number) => {
        _minDuration = data;
      });
      // 获取完整的信息
      _connectionTree.receive('getTree', (data: PrintOption, responder) => {
        const printer = new JsModulePrinter();
        responder.success(printer.getJson(data));
      });
      markListener.getJsModuleMeasure();
    },
    onDisconnect: () => {
      console.info('onDisconnect LaunchPerformanceTree');
      _connectionTree = null;
    },
    runInBackground: () => {
      return true;
    },
  });
}
