import { addPlugin, Flipper } from 'react-native-flipper';
import p from './performance';
import { JsModulePrinter, PrintOption } from './JsModulePrinter';

export function loadPlugin() {
  // 监听 measure事件
  const _observer = new p.PerformanceObserver(p.performance, (entry) => {
    // console.info(entry.name, entry.detail, entry.duration, entry.startTime);
    if (_connection) {
      if (entry.duration >= _minDuration) {
        _connection.send('measure', entry);
      }
    }
  });
  let _connection: Flipper.FlipperConnection | null;
  // 最小加载时间
  let _minDuration = 0;

  addPlugin({
    getId() {
      return 'LaunchPerformancePlugin';
    },
    onConnect(connection: Flipper.FlipperConnection) {
      _connection = connection;
      // 设置最小加载时间
      _connection.receive('setMinDuration', (data: number) => {
        _minDuration = data;
      });
      // 逐条监听 measure 事件
      _observer.observe({
        types: ['measure'],
      });
      // 获取完整的信息
      _connection.receive('getTree', (data: PrintOption, responder) => {
        const printer = new JsModulePrinter();
        responder.success(printer.getJson(data));
      });
    },
    onDisconnect() {
      _connection = null;
      _observer.disconnect();
    },
    runInBackground() {
      return true;
    },
  });
}
