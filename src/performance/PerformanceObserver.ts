import type { Entry, Performance } from './Performance';

type PerformanceObserverCallback = (entry: Entry) => void;

interface PerformanceObserverOption {
  name?: string;
  types?: Entry['entryType'][];
}

export class PerformanceObserver {
  _callback: PerformanceObserverCallback;
  _performance: Performance;
  _option: PerformanceObserverOption | null = null;

  constructor(performance: Performance, callback: PerformanceObserverCallback) {
    this._callback = callback;
    this._performance = performance;
    this._prosess = this._prosess.bind(this);
  }

  _prosess(entry: Entry) {
    if (!this._option) {
      this._callback(entry);
    } else {
      let match = true;
      if (this._option.name && this._option.name !== entry.name) {
        match = false;
      }
      if (this._option.types) {
        if (this._option.types.indexOf(entry.entryType) === -1) {
          match = false;
        }
      }

      if (match) {
        this._callback(entry);
      }
    }
  }

  observe(option?: PerformanceObserverOption): void {
    if (option) {
      this._option = option;
    }

    this._performance.on('mark', this._prosess, this);
    this._performance.on('measure', this._prosess, this);
  }

  disconnect(): void {
    this._performance.off('mark', this._prosess, this);
    this._performance.off('measure', this._prosess, this);
  }
}
