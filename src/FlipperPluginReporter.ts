import type { Flipper } from 'react-native-flipper';
import p from './performance';
import { markListener } from './MarkListener';
import { JsModulePrinter, PrintOption } from './JsModulePrinter';
import BaseBundle from './BaseBundle';

export function loadPlugin(addPlugin: Function) {
  // basebundle文件

  // 监听 measure事件
  const _observer = new p.PerformanceObserver(p.performance, (entry) => {
    if (!_connectionLog) {
      return;
    }

    if (entry.entryType === 'mark') {
      if (entry.name === 'JS_require_start') {
        _connectionLog.send('JS_require_start', {
          isBase: BaseBundle.isBase(entry.name),
          ...entry,
        });
      }
    } else if (entry.entryType === 'measure') {
      if (entry.duration >= _minDuration) {
        _connectionLog.send('measure', {
          isBase: BaseBundle.isBase(entry.name),
          ...entry,
        });
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
        types: ['measure', 'mark'],
      });
      markListener.getJsModuleMeasure();
    },
    onDisconnect: () => {
      console.info('onDisconnect LaunchPerformanceLog');
      _connectionLog = null;
      _observer.disconnect();
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
      const printer = new JsModulePrinter();
      _connectionTree = connection;
      // 设置最小加载时间
      _connectionTree.receive('setMinDuration', (data: number) => {
        _minDuration = data;
      });
      // 获取完整的信息
      _connectionTree.receive('getTree', (data: PrintOption, responder) => {
        console.info('receive getTree', data);
        responder.success(printer.getJson(data));
      });
      // 获取列表格式的加载信息
      _connectionTree.receive('getList', (data: PrintOption, responder) => {
        console.info('receive getList', data);
        responder.success(printer.getList(data));
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
