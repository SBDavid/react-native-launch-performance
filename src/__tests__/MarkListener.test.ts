import p from '../index';
import EventEmitter from 'eventemitter3';

const emitter = new EventEmitter();
p.markListener.listenForTestMarker(emitter);

// 重置开始时间
test("set originTime", async () => {
  emitter.emit("react-native-mark", [{
    name: "initTime",
    tag: "initTimeTag",
    timestamp: 123,
    type: "react-native-mark"
  }]);

  await new Promise((r) => {
    setTimeout(() => {r(null);}, 10);
  });

  expect(p.performance.timeOrigin).toBe(123);
});

// 发送开始事件
test("send testEventStart", async () => {
  emitter.emit("react-native-mark", [{
    name: "testEventStart",
    tag: "tag",
    timestamp: 100,
    type: "react-native-mark"
  }]);

  await new Promise((r) => {
    setTimeout(() => {r(null);}, 10);
  });

  expect(p.performance.getEntriesByName("testEventStart")[0].detail).toBe("tag");
});

// 发送结束事件
test("send testEventStart", async () => {
  emitter.emit("react-native-mark", [{
    name: "testEventEnd",
    tag: "tag",
    timestamp: 200,
    type: "react-native-mark"
  }]);

  await new Promise((r) => {
    setTimeout(() => {r(null);}, 10);
  });

  expect(p.performance.getEntriesByName("testEventEnd")[0].detail).toBe("tag");
});

// 时间计算，接受measure
test("find measure", async () => {
  await new Promise((r) => {
    setTimeout(() => {r(null);}, 100);
  });
  p.markListener.getMeasure();

  expect(p.performance.getEntriesByName("testEvent").length).toBe(1);
});