import React, { Component } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { Button } from 'nachos-ui';

export default class Home extends Component<{}> {
  static navigationOptions = {
    title: 'SnapLabs'
  };

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <Image
          style={styles.mainImage}
          source={{
            uri: "http://www.ti.com/ww/en/wireless_connectivity/sensortag/images/sensorTag-main-visual.png"
          }}
        />
        <Button onPress={() => navigate('Join')}>
          Join
        </Button>
      </View>
    );
  }
}

const styles = {
  mainImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  title: {
    flex: 1,
    fontSize: 19,
    fontWeight: 'bold',
  },
};
