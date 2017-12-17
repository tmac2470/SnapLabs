import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import { connectStyle } from "@shoutem/theme";

class App extends Component<{}> {
  render() {
    const styles = this.props.style;
    return (
      <View style={styles.container}>
        <Image
          style={styles.avatarImage}
          source={{
            uri: "https://shoutem.github.io/img/ui-toolkit/examples/image-9.png"
          }}
        />
        <Text style={styles.title}>John Doe</Text>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  avatarImage: {
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

// connect the component to the theme
export default connectStyle('com.example.App', styles)(App);