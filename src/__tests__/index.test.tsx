import p from '../index';

const performance = p.performance;

// 添加标记
test("now", () => {
  expect(p.performance.now - (Date.now() - performance.timeOrigin)).toBeLessThan(5);
});