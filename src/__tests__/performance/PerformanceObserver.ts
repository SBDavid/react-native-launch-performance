import p from '../../index';

const performance = p.performance;
const PerformanceObserver = p.PerformanceObserver;

test("see mark", async () => {

  let seeMark = false;

  const observer = new PerformanceObserver(performance, (entry) => {
    if (entry.entryType === 'mark') {
      seeMark = true;
    }
  });
  observer.observe({types: ['mark']});
  performance.mark("mark-1");
  await new Promise((r) => {
    setTimeout(() => {r(null);}, 10);
  });
  observer.disconnect();
  expect(seeMark).toBeTruthy();
});

test("see measure", async () => {
  let seeMeasure = false;
  let seeMark = false;

  const observer = new PerformanceObserver(performance, (entry) => {
    if (entry.entryType === 'measure') {
      seeMeasure = true;
    }

    if (entry.entryType === 'mark') {
      seeMark = true;
    }
  });

  observer.observe({types: ['measure']});

  performance.mark("mark-1");
  performance.mark("mark-2");
  performance.measure("measure-1", "mark-1", "mark-2");

  await new Promise((r) => {
    setTimeout(() => {r(null);}, 10);
  });

  expect(seeMeasure).toBeTruthy();
  expect(seeMark).toBeFalsy();
});