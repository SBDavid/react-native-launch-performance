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
- 需要指定分支的android包，请联系我
- 环境配置
  - 安装JDK: https://www.jianshu.com/p/a85658902f26
  - 安装Android SDK: 
    - 下载：https://developer.android.com/studio?gclid=Cj0KCQjw2NyFBhDoARIsAMtHtZ6VV_W52rASTc3q3g1qWuz3iR860Z0R3ysxeyxcGOfAjuLFNK_fqh4aAn1LEALw_wcB&gclsrc=aw.ds
    - 配置： https://developer.android.com/about/versions/11/setup-sdk
    - 环境变量配置：
      - export ANDROID_HOME=/Users/jiaweitang/Library/Android/sdk
      - export ANDROID_SDK=/Users/jiaweitang/Library/Android/sdk
- 下载Filipper https://fbflipper.com
  - 右下角点击`Setup Doctor`确认环境配置是否成功
- 安装可视化插件
  - [LaunchPerformanceLog](https://github.com/SBDavid/flipper-plugin-launchperformancetree-client)
  - ![LaunchPerformanceLog](/log-demo.jpg)
  - [LaunchPerformanceTree](https://github.com/SBDavid/flipper-plugin-launchperformance-client)
  - ![LaunchPerformanceTree](/tree-demo.jpg)
- 安装开发依赖 npm i --save -dev react-native-flipper
- 初始化插件（请不要在生产环境下安装插件）
```js
// 仅在开发环境中使用，生产环境有其他方法
if(__DEV__) {
  const LaunchPerformance = require('@xmly/react-native-launch-performance');
  const flipper = require('react-native-flipper');
  LaunchPerformance.default.loadPlugin(flipper.addPlugin);
}
```

### 2. 通过Api获取数据，可对数据进行二次加工

本模块中的 Performance Api 和 web 中的项目相关概念一致，包括`mark`和`measure`概念。[请参考mozilla文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance)

推荐在项目入口引入 react-native-launch-performance 模块。

```js
if (__DEV__) {
	const LaunchPerformance = require('@xmly/react-native-launch-performance')

	// 通过 PerformanceObserver 注册性能时间的监听回调
	const observer = new LaunchPerformance.default.PerformanceObserver(
		LaunchPerformance.default.performance,
		(entry: any) => {
			console.info(entry.name, entry.duration, entry.startTime)
		}
	)

	// 选择要监听的entry类型，包含 measure 和 mark 两种。
	// mark 记录的是事件发生的时间戳
	// measure 记录的是通过 mark 计算得出的模块加载时长
	observer.observe({
		types: ['measure']
	})

	// 主动触发性能数据的计算
	// 推荐在一定延时后执行，以免影响首页启动性能
	setTimeout(() => {
		LaunchPerformance.default.markListener.getJsModuleMeasure();
	}, 2000)
}
```

你也可以通过 getJsModuleMeasure 接口直接获得数据
返回measure对象的数组
```js
if (__DEV__) {
  const LaunchPerformance = require('@xmly/react-native-launch-performance')
  const measures = LaunchPerformance.default.markListener.getJsModuleMeasure();
}
```

你也可以以Json格式获取加载数据
你可对树形结构进行遍历
```js
if (__DEV__) {
	const LaunchPerformance = require('@xmly/react-native-launch-performance')
	setTimeout(() => {
		const printer = new LaunchPerformance.default.JsModulePrinter()
		console.info(printer.getJson())
	}, 2000)
}
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
你可以使用 react-navigation-lazy-screen 实现页面懒加载 https://github.com/SBDavid/react-navigation-lazy-screen
```jsx
<RootStack.Screen name="StackScreen">
  {(props) => {
    return (
      <LazyScreen
        {...props}
        pageName="Home"
        fallback={<Text>Loading...</Text>}
        factory={() => import('../screen/StackScreen')}
      />
    );
  }}
</RootStack.Screen>
```

你也可以使用 [React.lazy](https://reactjs.org/docs/code-splitting.html) 实现组件的动态加载。
** 此方法有bug，无法收到首个focus事件 **


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

