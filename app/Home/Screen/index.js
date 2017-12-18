import React, { Component } from "react";
import { View, Image, Platform } from "react-native";
import { Button, H2 } from "nachos-ui";

import Colors from '../../Theme/colors';

export default class Home extends Component<{}> {
  static navigationOptions = {
    title: "SnapLabs"
  };

  render() {
    const { navigate } = this.props.navigation;
    const iOSpic = require('../../../data/images/ti-sensor-tag.jpeg');
    const androidPic = require('../../../data/images/ti-sensor.png');

    const pic = Platform.OS === 'ios' ? iOSpic : androidPic;

    return (
      <View style={styles.container}>
        <Image source={pic} style={styles.image} />
        <H2 style={styles.textStyle}>Create. Investigate. Share.</H2>
        <View style={styles.btnContainer}>
          <Button onPress={() => navigate("Join")} style={styles.joinButton}>
            Join
          </Button>
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "white"
  },
  image: {
    width: "100%",
    height: "60%"
  },
  joinButton: {
    minWidth: '100%'
  },
  btnContainer: {
    margin: "10%",
    marginTop: "12%",
    flex: 1
  },
  textStyle: {
    color: Colors.primaryBackground,
    fontWeight: '600'
  }
};
