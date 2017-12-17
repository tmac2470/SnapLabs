import React, { Component } from "react";
import { StyleSheet, Text, View, Image, Button } from "react-native";

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
        <Button
          onPress={() => navigate('Join')}
          title="Join"
        />
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
