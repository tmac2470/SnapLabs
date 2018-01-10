import React, { Component } from "react";
import { connect } from "react-redux";

import * as _ from "lodash";

import { View, Image, Platform, ScrollView } from "react-native";
import { Button, H2, H4, H5, H6 } from "nachos-ui";

import Colors from "../../Theme/colors";
import * as utils from "./utils";

export class InvestigationDetailsComponent extends Component<{}> {
  static navigationOptions = {
    title: "Investigation Details"
  };

  state = {
    connectedDevices: {},
    investigation: {},
    sensors: [],
    graphs: {
      started: true,
      startedAtLeastOnce: true
    },
    sampleIntervalTime: 1000,
    display: {
      graph: true,
      grid: false
    },
    datasetsAvailable: [{ key: 1 }],
    charts: {}
  };

  componentWillMount() {
    const { navigation, connectedDevices } = this.props;
    const investigation = navigation.state.params.investigation;

    const _assignState = async tags => {
      const sampleIntervalTime = parseInt(investigation.sampleInterval);
      const sensors = await utils._getSensorTags(tags);

      this.setState({
        investigation,
        sampleIntervalTime,
        sensors,
        connectedDevices
      });
    };
    _assignState(investigation.sensorTags);
  }

  render() {
    const { navigation } = this.props;
    const {
      connectedDevices,
      datasetsAvailable,
      display,
      graphs,
      investigation,
      sampleIntervalTime,
      sensors
    } = this.state;
    const isConnectedToDevices = Object.keys(connectedDevices);
    const connectedText =
      Object.keys(connectedDevices).length > 0
        ? "Connected!"
        : "Not connected!";

    return (
      <View style={styles.container}>
        <ScrollView>
          <H2 style={[styles.header, styles.text, styles.textBold]}>
            {investigation.labTitle}
          </H2>

          <View style={styles.contentBox}>
            <H5 style={[styles.text, styles.textBold]}>
              Sample Interval: {sampleIntervalTime}ms
            </H5>
            <H5 style={[styles.text, styles.textBold]}>
              Status: {connectedText}
            </H5>
            {!isConnectedToDevices
              ? null
              : Object.keys(connectedDevices).map(deviceId => (
                  <H6>Sensor tag: {deviceId}</H6>
                ))}
          </View>

          {datasetsAvailable.length > 0 ? null : (
            <View style={styles.contentBox}>
              <H5 style={[styles.text, styles.textBold]}>
                No sensors enabled to run the investigation!
              </H5>
              <H5 style={styles.text}>
                Please recheck if at least one parameter (eg IR) has been
                enabled for the chosen sensor (eg Temperature).
              </H5>
            </View>
          )}

          {sensors.length <= 0 ? null : (
            <View>
              {sensors.map((sensor, i) => {
                return (
                  <View style={styles.contentBox} key={i}>
                    <H4 style={[styles.text, styles.textBold]}>
                      {sensor.name}
                    </H4>

                    {sensor.parameters.length <= 0 ? null : (
                      <View>
                        <H6 style={styles.text}>Sensor parameters:</H6>
                        {sensor.parameters.map((param, j) => {
                          return (
                            <View key={i + j} style={styles.twoColBox}>
                              <H5 style={[styles.text, styles.textBold]}>
                                {param.key}
                              </H5>
                              <H5 style={[styles.text, styles.textBold]}>
                                {param.value ? "ON" : "OFF"}
                              </H5>
                            </View>
                          );
                        })}
                      </View>
                    )}

                    {!isConnectedToDevices
                      ? null
                      : Object.keys(connectedDevices).map(deviceId => (
                          <View key={deviceId} style={styles.twoColBox}>
                            <H5 style={styles.text}>Device {deviceId}</H5>
                            <H5 style={[styles.text, styles.textBold]}>
                              {connectedDevices[deviceId].value}
                            </H5>
                          </View>
                        ))}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View style={styles.footerButtonContainer}>
          {display.graph && datasetsAvailable.length > 0 ? (
            <View style={styles.footerInnerContainer}>
              {!graphs.startedAtLeastOnce ? null : (
                <Button
                  uppercase={false}
                  onPress={() => {}}
                  style={styles.footerButton}
                >
                  Save graph data
                </Button>
              )}

              {graphs.started ? (
                <View>
                  <Button
                    uppercase={false}
                    onPress={() => {}}
                    style={styles.footerButton}
                  >
                    Stop graphs
                  </Button>
                  <Button
                    uppercase={false}
                    onPress={() => {}}
                    style={styles.footerButton}
                  >
                    Reset graphs
                  </Button>
                </View>
              ) : (
                <Button
                  uppercase={false}
                  onPress={() => {}}
                  style={styles.footerButton}
                >
                  Start graphs
                </Button>
              )}
            </View>
          ) : null}

          {display.grid && datasetsAvailable.length > 0 ? (
            <View>
              <Button
                uppercase={false}
                onPress={() => {}}
                style={styles.footerButton}
              >
                Save grid data
              </Button>
              <Button
                uppercase={false}
                onPress={() => {}}
                style={styles.footerButton}
              >
                Reset grids
              </Button>
            </View>
          ) : null}
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.light
  },
  header: {
    paddingRight: 10,
    paddingLeft: 10
  },
  contentBox: {
    backgroundColor: Colors.white,
    margin: 10,
    marginTop: 5,
    marginBottom: 5,
    paddingRight: 10,
    paddingLeft: 10
  },
  twoColBox: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    maxWidth: "80%"
  },
  text: {
    color: Colors.secondary
  },
  textBold: {
    fontWeight: "600"
  },
  footerButtonContainer: {
    minHeight: 120,
    padding: 10
  },
  footerInnerContainer: {
    flexDirection: "column",
    alignItems: "center"
  },
  footerButton: {
    width: "100%"
  }
};

const mapStateToProps = state => {
  return {
    connectedDevices: state.bluetooth.connectedDevices
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(
  InvestigationDetailsComponent
);
