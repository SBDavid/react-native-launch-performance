import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import LaunchPerformance from 'react-native-launch-performance';

export default class App extends React.PureComponent {

  componentDidMount() {
    LaunchPerformance.performance.mark("mark1");
    console.info(LaunchPerformance.performance.getEntries());
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Result: </Text>
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
