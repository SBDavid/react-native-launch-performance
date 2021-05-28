# react-native-launch-performance

react-native-launch-performance 是一个分析RN启动性能的工具。支持一下三方面的分析。

- **JS模块载入耗时**：一般包括js文件载入内存、jsCore解释js代码、jsCore执行代码中的define方法得到模块的基础信息，运行require方法得到模块的导出对象。JS模块存在相互依赖关系，如果模块A依赖模块B，那么模块A的加载时长中包含了B的加载时长。
- **native模块加载耗时**：处于开发阶段
- **网络请求耗时**：处于开发阶段

## Contents
- [react-native-launch-performance](#react-native-launch-performance)
  - [Contents](#contents)
  - [📋 Requirements](#-requirements)
  - [🎉 Installation](#-installation)
  - [Usage](#usage)
    - [1. 通过Flipper查看数据](#1-通过flipper查看数据)
    - [2. 通过Api获取数据，可对数据进行二次加工](#2-通过api获取数据可对数据进行二次加工)
  - [📖 Common bad case](#-common-bad-case)
    - [1. 引入大型三方库](#1-引入大型三方库)
    - [2. 过早的引入三方库](#2-过早的引入三方库)
    - [3. Router未使用懒加载](#3-router未使用懒加载)

## 📋 Requirements

支持android和ios平台

React-native: 0.56+

## 🎉 Installation

```sh
# 安装依赖
npm install @xmly/react-native-launch-performance
```

```javascript
// 配置metro.config.js
// 目的是为了在RN模块系统中加入模块初始化的时间节点
module.exports = {
  serializer: {
    polyfillModuleNames: [require.resolve('@xmly/react-native-launch-performance/src/lib/polyfills/require.js')]
  }
}
```

## Usage

### 1. 通过Flipper查看数据
- 下载Filipper https://fbflipper.com
- 安装可视化插件
  - LaunchPerformanceLog
  - ![LaunchPerformanceLog](/log-demo.jpg)
  - LaunchPerformanceTree
  - ![LaunchPerformanceTree](/tree-demo.jpg)
- 安装开发依赖 npm i --save -dev react-native-flipper
- 初始化插件
```js
// index.js
import LaunchPerformance from '@xmly/react-native-launch-performance';
import { addPlugin } from 'react-native-flipper';
LaunchPerformance.loadPlugin(addPlugin);
```

### 2. 通过Api获取数据，可对数据进行二次加工

本模块中的 Performance Api 和 web 中的项目相关概念一致，包括`mark`和`measure`概念。[请参考mozilla文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance)

推荐在项目入口引入 react-native-launch-performance 模块。

```js
import LaunchPerformance from "@xmly/react-native-launch-performance";

// 通过 PerformanceObserver 注册性能时间的监听回调
const observer = new LaunchPerformance.PerformanceObserver(LaunchPerformance.performance, (entry) => {
  console.info(entry.name, entry.detail, entry.duration, entry.startTime);
});

// 选择要监听的entry类型，包含 measure 和 mark 两种。
// mark 记录的是事件发生的时间戳
// measure 记录的是通过 mark 计算得出的模块加载时长
observer.observe({
  types: ['measure']
});

// 主动触发性能数据的计算
// 推荐在一定延时后执行，以免影响首页启动性能
setTimeout(() => {
  LaunchPerformance.markListener.getJsModuleMeasure();
}, 2000);

// 你也可以通过 getJsModuleMeasure 接口直接获得数据
const measures = LaunchPerformance.markListener.getJsModuleMeasure();
```

你也可以以Json格式获取加载数据
```js
import LaunchPerformance from '@xmly/react-native-launch-performance';
setTimeout(() => {
  const printer = new LaunchPerformance.JsModulePrinter();
  printer.printJson({
    minDuratin: 10
  });
}, 2000);
```

## 📖 Common bad case
以下是一些常见的错误用例，这些做法可能会引发首屏发生白屏

### 1. 引入大型三方库
例如在首页引入 react-native-redash。我们通常不建议在首页中通过 import 方式引入改模块。如果必须使用它，建议在首页显示后通过懒加载方式引入。

``` js
class CompA extends Component {
  componentDidMount() {
    var redash = require('react-native-redash');
  }
}
```

你也可以直接饮用子模块

```js
import { timing } from 'react-native-redash/lib/module/AnimationRunners';
```

你也可以把大型三方库加入到BaseBundle中

### 2. 过早的引入三方库

某些模块中的功能只会在特定的逻辑分支中触发，例如点击某个按钮后触发某项功能。在这种情况下我们没有必要在文件的最顶端通过 import 方式引入模块。推荐在代码的逻辑分支中通过 require 加载模块，因为如果首屏不进入该分支，那么模块就不会被引入。

**VeryExpensive.js**

```jsx
import React, { Component } from 'react';
import { Text } from 'react-native';
// ... import some very expensive modules

// You may want to log at the file level to verify when this is happening
console.log('VeryExpensive component loaded');

export default class VeryExpensive extends Component {
  // lots and lots of code
  render() {
    return <Text>Very Expensive Component</Text>;
  }
}
```

**Optimized.js**[](https://reactjs.org/docs/code-splitting.html)

```jsx
import React, { Component } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

let VeryExpensive = null;

export default class Optimized extends Component {
  state = { needsExpensive: false };

  didPress = () => {
    if (VeryExpensive == null) {
      VeryExpensive = require('./VeryExpensive').default;
    }

    this.setState(() => ({
      needsExpensive: true
    }));
  };

  render() {
    return (
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity onPress={this.didPress}>
          <Text>Load</Text>
        </TouchableOpacity>
        {this.state.needsExpensive ? <VeryExpensive /> : null}
      </View>
    );
  }
}
```

### 3. Router未使用懒加载

对于具有多个页面的RN应用，建议编写导航时使用懒加载方式（首页除外），懒加载可以显著首屏需要加载的模块数量。

**BadCase.js**

```jsx
import CompA from 'CompA'; // 直接引用未使用动态加载

function App () {
  return (
    <NavigationContainer>
    	<Stack.Navigator>
        <Stack.Screen
          name={ "name" }
          component={ CompA } />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**GoodCase.js**

你可以使用 [React.lazy](https://reactjs.org/docs/code-splitting.html) 实现组件的动态加载。

```jsx
function App () {
  return (
    <NavigationContainer>
    	<Stack.Navigator>
        <Stack.Screen name={ "name" }>
          { (props) => {
            const CompA = React.lazy(() => import('./CompA'));
            return (
              <Suspense fallback={<div>Loading...</div>}>
                <CompA />
              </Suspense>
            );
          } }
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

