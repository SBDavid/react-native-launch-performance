// @ts-ignore
import treeify from 'treeify';
import { Platform } from 'react-native';

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

interface PrintOption {
  depth?: number;
  minDuratin?: number;
}

interface MappingFile {
  mappings: {
    [key: string]: number;
  };
}

// 打印出树形模块依赖结构并显示加载时间
export class JsModulePrinter {
  modules: JsModuleScr[];
  option: PrintOption = {};
  // basebundle文件
  mappingFile: MappingFile;

  constructor() {
    // 获得模块数据
    // @ts-ignore
    this.modules = require.getModules();
    this.mappingFile = { mappings: {} };
    this._loadMapping();
  }

  // 加载basebundle中的mapping文件，仅在开发阶段使用
  _loadMapping() {
    if (__DEV__) {
      if (Platform.OS === 'ios') {
        this.mappingFile = require('../basebundle/ios/mapping.base.json');
      } else {
        this.mappingFile = require('../basebundle/android/mapping.base.json');
      }
    }
  }

  printTree(option: PrintOption) {
    this.option = option;
    if (!this.option) {
      this.option = {};
    }
    console.log(treeify.asTree(this._buildTree(0), true));
  }

  printJson(option: PrintOption) {
    this.option = option;
    if (!this.option) {
      this.option = {};
    }
    const tree = this._buildTree(0);
    console.info(JSON.stringify(tree));
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
    const mappings = this.mappingFile.mappings;
    const tree: JsModule = {
      verboseName: module.verboseName,
      isBase: mappings[module.verboseName] !== undefined,
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
