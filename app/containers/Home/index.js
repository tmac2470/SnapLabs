import React, { Component } from "react";
import { connect } from "react-redux";

import { View, Image, Platform } from "react-native";
import { Button, H2 } from "nachos-ui";

import Colors from "../../Theme/colors";

export class HomeComponent extends Component<{}> {
  static navigationOptions = ({ navigation }) => {
    console.log(navigation);
    const { params = {} } = navigation.state;

    return {
      title: "SnapLabs",
      headerLeft: null,
      ...navigation.state.params
    };
  };

  componentWillMount() {
    const { navigation, isLoggedIn } = this.props;

    if (isLoggedIn) {
      const params = {
        headerRight: (
          <Button type="danger" onPress={this.logout} style={[styles.button, styles.logoutButton]}>
            Logout
          </Button>
        )
      };
      navigation.setParams(params);
    }
  }

  logout() {
    console.log("called logout");
  }

  render() {
    const { navigation, isLoggedIn } = this.props;

    const iOSpic = require("../../../data/images/ti-sensor-tag.jpeg");
    const androidPic = require("../../../data/images/ti-sensor.png");

    const pic = Platform.OS === "ios" ? iOSpic : androidPic;

    return (
      <View style={styles.container}>
        <Image source={pic} style={styles.image} />
        <H2 style={styles.textStyle}>Create. Investigate. Share.</H2>
        <View style={styles.btnContainer}>
          {!isLoggedIn ? (
            <Button
              onPress={() => navigation.navigate("Join")}
              style={styles.button}
            >
              Join
            </Button>
          ) : (
            <View>
              <Button
                onPress={() => navigation.navigate("Join")}
                style={styles.button}
              >
                Select a local investigation
              </Button>

              <Button
                onPress={() => navigation.navigate("Join")}
                style={styles.button}
              >
                Download a new investigation
              </Button>

              <Button
                onPress={() => navigation.navigate("Join")}
                style={styles.button}
              >
                File handling
              </Button>
            </View>
          )}
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
  button: {
    minWidth: "100%",
    maxHeight: 40
  },
  logoutButton: {
    maxHeight: 40
  },
  btnContainer: {
    margin: 20,
    marginTop: 20,
    flex: 1
  },
  textStyle: {
    color: Colors.primary,
    fontWeight: "600"
  }
};

const mapStateToProps = state => {
  return {
    user: state.currentUser,
    isLoggedIn: state.currentUser.isLoggedIn
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeComponent);
