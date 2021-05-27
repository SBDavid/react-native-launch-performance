// @ts-ignore
import treeify from 'treeify';
import BaseBundle from './BaseBundle';

// 用于打印的模块结构
interface JsModule {
  verboseName: string;
  children: JsModule[];
  offset: number;
  duration: number;
  isBase: boolean;
}

// 数据源中的模块结构
interface JsModuleScr {
  id: number;
  verboseName: string;
  dependencyMap: number[];
  beginTime: number;
  endTime: number;
}
interface JsModuleList {
  id: number;
  verboseName: string;
  dependencyMap: number[];
  offset: number;
  duration: number;
  isBase: boolean;
}

export interface PrintOption {
  initId?: number;
  depth?: number;
  minDuratin?: number;
}

// 打印出树形模块依赖结构并显示加载时间
export class JsModulePrinter {
  modules: JsModuleScr[];
  option: PrintOption = {};

  constructor() {
    // 获得模块数据
    // @ts-ignore
    this.modules = require.getModules();
  }

  printTree(option: PrintOption) {
    this.option = option;
    if (!this.option) {
      this.option = {};
    }
    console.log(treeify.asTree(this._buildTree(0), true));
  }

  printJson(option: PrintOption) {
    console.info(this.getJson(option));
  }

  getJson(option: PrintOption) {
    this.option = option;
    if (!this.option) {
      this.option = {
        initId: 0,
      };
    }
    return this._buildTree(this.option.initId as number);
  }

  getList(option: PrintOption) {
    this.option = option;
    if (!this.option) {
      this.option = {
        initId: 0,
      };
    }
    const startTime = this.modules[this.option.initId as number].beginTime;
    const list: JsModuleList[] = [];

    let index = 0;
    while (this.modules[index] !== undefined) {
      const module = this.modules[index];
      list.push({
        id: index,
        verboseName: module.verboseName,
        dependencyMap: module.dependencyMap,
        isBase: BaseBundle.isBase(module.verboseName),
        offset: module.beginTime - startTime,
        duration: module.endTime - module.beginTime,
      });

      index++;
    }
    return { data: list };
  }

  _buildTree(initId: number): JsModule | null {
    const loadedModules: number[] = [];
    const startTime = this.modules[initId].beginTime;

    return this._buildJsModuleTree(initId, loadedModules, startTime, 1);
  }

  _buildJsModuleTree(
    moduleId: number,
    loadedModules: number[],
    startTime: number,
    depth: number
  ): JsModule | null {
    const module = this.modules[moduleId];
    const tree: JsModule = {
      verboseName: module.verboseName,
      isBase: BaseBundle.isBase(module.verboseName),
      offset: module.beginTime - startTime,
      duration: module.endTime - module.beginTime,
      children: [],
    };

    // 防止无限递归
    if (loadedModules.indexOf(moduleId) !== -1) {
      return null;
    }

    if (this.option.depth !== undefined && this.option.depth < depth) {
      return null;
    }

    if (
      this.option.minDuratin !== undefined &&
      this.option.minDuratin > tree.duration
    ) {
      return null;
    }

    loadedModules.push(moduleId);

    // 从未加载的模块
    const dependencyMapNew = module.dependencyMap.filter(
      (dep) => loadedModules.indexOf(dep) === -1 && this.modules[dep].beginTime
    );

    // @ts-ignore
    tree.children = dependencyMapNew
      .map((dep) => {
        return this._buildJsModuleTree(
          dep,
          loadedModules,
          startTime,
          depth + 1
        );
      })
      .filter((mod) => mod !== null);

    return tree;
  }
}
