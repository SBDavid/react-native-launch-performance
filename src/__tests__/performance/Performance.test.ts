import p from '../../index';

const performance = p.performance;

// 添加标记
test('add mark-1', () => {
  performance.mark('mark-1');
  const marks = performance.getEntriesByName('mark-1');
  expect(marks.length).toBe(1);
});

// 添加标记
test('clean mark-1', () => {
  performance.clearMarks("mark-1");
  const marks = performance.getEntriesByName('mark-1');
  expect(marks.length).toBe(0);
});

// 测量
jest.setTimeout(30000);
test("measure measure-1", async () => {
  performance.mark('mark-1');
  await new Promise((r) => {
    setTimeout(() => {r(null);}, 1000);
  });
  performance.mark('mark-2');
  performance.measure("measure-1", "mark-1", "mark-2");
  const measures = performance.getEntriesByName("measure-1");
  expect(measures.length).toBe(1);
  expect(measures[0].duration).toBeGreaterThan(500);
});

// 接受事件
test("listen for mark and measure", async () => {
  let mark = false;
  let measure = false;
  performance.on("mark", () => {
    mark = true;
  });
  performance.on("measure", () => {
    measure = true;
  });
  performance.mark('mark-1');
  performance.mark('mark-2');
  performance.measure("measure-1", "mark-1", "mark-2");
  await new Promise((r) => {
    setTimeout(() => {r(null);}, 100);
  });
  expect(mark && measure).toBeTruthy();
});

// detail
test("add detail", () => {
  performance.cleanAllEntries();
  performance.mark('mark-1', "start");
  performance.mark('mark-2', "end");
  performance.measure("measure-1", 'mark-1', 'mark-2');

  expect(performance.getEntriesByName('mark-1')[0].detail).toStrictEqual("start");
  expect(performance.getEntriesByName('mark-2')[0].detail).toStrictEqual("end");
  expect(performance.getEntriesByName('measure-1')[0].detail.start).toStrictEqual("start");
  expect(performance.getEntriesByName('measure-1')[0].detail.end).toStrictEqual("end");

});
