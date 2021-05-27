import { Platform } from 'react-native';

interface MappingFile {
  mappings: {
    [key: string]: number;
  };
}

export default class BaseBundle {
  // basebundle文件
  static mappingFile: MappingFile;

  // 加载basebundle中的mapping文件，仅在开发阶段使用
  static loadMapping() {
    if (BaseBundle.mappingFile) {
      return;
    }
    if (__DEV__) {
      if (Platform.OS === 'ios') {
        BaseBundle.mappingFile = require('../basebundle/ios/mapping.base.json');
      } else {
        BaseBundle.mappingFile = require('../basebundle/android/mapping.base.json');
      }
    }
  }

  static isBase(name: string) {
    BaseBundle.loadMapping();
    return (
      BaseBundle.mappingFile.mappings[name.replace('JS_require_', '')] !==
      undefined
    );
  }
}
