/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Log from './../services/logging';

export default class App extends Component<Props> {
  render() {
    Log.info('Welcome! 🎉 Please help me improve by raising PR and issues on Github. ');
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome!</Text>
        <Text style={styles.instructions}>Hope this helps</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
