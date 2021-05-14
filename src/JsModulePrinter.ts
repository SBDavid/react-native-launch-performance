// @ts-ignore
import treeify from 'treeify';

// 用于打印的模块结构
interface JsModule {
  verboseName: string;
  children: JsModule[];
  offset: number;
  duration: number;
}

// 数据源中的模块结构
interface JsModuleScr {
  id: number;
  verboseName: string;
  dependencyMap: number[];
  beginTime: number;
  endTime: number;
}

// 打印出树形模块依赖结构并显示加载时间
export class JsModulePrinter {
  modules: JsModuleScr[];

  constructor() {
    // 获得模块数据
    // @ts-ignore
    this.modules = require.getModules();
  }

  print(/* depth: number, minDuratin: number */) {
    console.log(treeify.asTree(this._buildTree(0), true));
  }

  _buildTree(initId: number): JsModule {
    const loadedModules: number[] = [];
    const startTime = this.modules[initId].beginTime;

    return this._buildJsModuleTree(initId, loadedModules, startTime);
  }

  _buildJsModuleTree(
    moduleId: number,
    loadedModules: number[],
    startTime: number
  ): JsModule {
    const module = this.modules[moduleId];
    const tree: JsModule = {
      verboseName: module.verboseName,
      offset: module.beginTime - startTime,
      duration: module.endTime - module.beginTime,
      children: [],
    };

    // 防止无限递归
    if (loadedModules.indexOf(moduleId) !== -1) {
      return tree;
    }

    loadedModules.push(moduleId);

    tree.children = module.dependencyMap.map((dep) => {
      return this._buildJsModuleTree(dep, loadedModules, startTime);
    });

    return tree;
  }
}
