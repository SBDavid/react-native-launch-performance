import * as React from 'react';
import { StyleSheet, View, Text, } from 'react-native';
import LaunchPerformance from 'react-native-launch-performance';
LaunchPerformance.markListener.listenForReactNativeMarker();

export default class App extends React.PureComponent {

  componentDidMount() {
    const observer = new LaunchPerformance.PerformanceObserver(LaunchPerformance.performance, (entry) => {
      console.info(entry.name, entry.detail, entry.duration, entry.startTime);
    });
    observer.observe({
      types: ['measure']
    });

    setTimeout(() => {
      LaunchPerformance.markListener.getMeasure();
    }, 2000);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Result: 11</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
