import { EventEmitter } from 'eventemitter3';

interface EntryProps {
  name: string;
  entryType: 'mark' | 'measure';
  startTime: number;
  duration: number;
  detail?: any;
}

export class Entry implements EntryProps {
  name = this.props.name;
  entryType = this.props.entryType;
  startTime = this.props.startTime;
  duration = this.props.duration;
  detail = this.props.detail;

  constructor(private props: EntryProps) {}

  toJSON() {
    return this.props;
  }
}

const dateNow = Date.now || (() => Date.now());
const startOffset = dateNow();
const Exception = Error;

export class Performance extends EventEmitter {
  _entries: Entry[] = [];
  _marksIndex: { [name: string]: Entry } = {};

  _filterEntries<K extends keyof Entry>(key: K, value: Entry[K]) {
    const n = this._entries.length;
    const result = [];
    let i = 0;

    for (; i < n; i++) {
      if (this._entries[i][key] === value) {
        result.push(this._entries[i]);
      }
    }

    return result;
  }

  _clearEntries(type: Entry['entryType'], name: string) {
    let i = this._entries.length;

    while (i--) {
      const entry = this._entries[i];

      if (
        entry.entryType === type &&
        (name === undefined || entry.name === name)
      ) {
        this._entries.splice(i, 1);
      }
    }
  }

  // 当前时间距离启动的时长
  get now() {
    return dateNow() - startOffset;
  }

  get timeOrigin() {
    return startOffset;
  }

  mark(name: string, detail?: any) {
    const mark = new Entry({
      name: name,
      entryType: 'mark',
      startTime: this.now,
      duration: 0,
      detail: detail,
    });

    this._entries.push(mark);
    this._marksIndex[name] = mark;
    this.emit('mark', mark);
  }

  measure(name: string, startMark: string, endMark: string) {
    const argLen = arguments.length;
    let errMark: string = '';

    if (name == null) {
      throw new TypeError(
        `Failed to execute 'measure' on 'Performance': 1 argument required, but only 0 present.`
      );
    } else if (this._marksIndex[startMark] == null) {
      errMark = startMark;
    } else if (this._marksIndex[endMark] == null) {
      errMark = endMark;
    }

    if (errMark !== '') {
      throw new Exception(
        `Failed to execute 'measure' on 'Performance': The mark '${errMark}' does not exist.`
      );
    }

    const start = argLen > 1 ? this._marksIndex[startMark].startTime : this.now;
    const end = argLen > 2 ? this._marksIndex[endMark].startTime : this.now;
    const entry = new Entry({
      name,
      entryType: 'measure',
      startTime: start,
      duration: end - start,
      detail: {
        start: this._marksIndex[startMark].detail,
        end: this._marksIndex[endMark].detail,
      },
    });

    this._entries.push(entry);
    this.emit('measure', entry);

    return entry;
  }

  getEntries(filter?: Pick<Entry, 'name' | 'entryType'>) {
    if (filter != null) {
      return this._entries.filter(
        (entry) =>
          entry.name === filter.name && entry.entryType === filter.entryType
      );
    }
    return this._entries;
  }

  getEntriesByType(type: Entry['entryType']) {
    return this._filterEntries('entryType', type);
  }

  getEntriesByName(name: string) {
    return this._filterEntries('name', name);
  }

  clearMarks(name: string) {
    this._clearEntries('mark', name);
    delete this._marksIndex[name];
  }

  clearMeasures(name: string) {
    this._clearEntries('measure', name);
  }

  cleanAllEntries() {
    this._entries = [];
    this._marksIndex = {};
  }
}
