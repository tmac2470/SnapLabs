import React, { Component } from "react";
import { connect } from "react-redux";
import { View } from "react-native";
import { Button } from "nachos-ui";
import InvestigationList from "../../../components/InvestigationList";

import Colors from "../../../Theme/colors";
import { fetchInvestigationById, deleteInvestigation } from "../Local/actions";

export class LocalInvestigationsComponent extends Component<{}> {
  static navigationOptions = {
    title: "Local Investigations"
  };

  state = {
    expand: {}
  };

  _onExpandInvestigation(investigation) {
    const { expand } = this.state;
    this.setState({
      expand: { [investigation._id]: !expand[investigation._id] }
    });
  }

  _convertObjectToArray = obj => {
    return Object.keys(obj).map(function(key) {
      return obj[key];
    });
  };

  render() {
    const {
      localInvestigations,
      navigation,
      onDeleteInvestigation,
      onDownloadInvestigation
    } = this.props;
    const localInvestigationsArray = this._convertObjectToArray(
      localInvestigations
    );

    return (
      <View style={styles.container}>
        <InvestigationList
          investigations={localInvestigationsArray}
          localInvestigations={localInvestigations}
          onRefresh={() => {}}
          extraData={this.state}
          onDownloadInvestigation={onDownloadInvestigation}
          navigation={navigation}
          onDeleteInvestigation={onDeleteInvestigation}
          expandInvestigation={this._onExpandInvestigation.bind(this)}
        />

        <View style={styles.footerButtonContainer}>
          <Button
            uppercase={false}
            onPress={() => navigation.navigate("BluetoothConnect")}
            style={styles.footerButton}
          >
            Sensor Tags
          </Button>
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flexDirection: "column",
    flex: 1
  },
  footerButtonContainer: {
    flex: 1,
    maxHeight: 60,
    padding: 10
  },
  footerButton: {
    width: "100%",
    borderRadius: 0
  }
};

const mapStateToProps = state => {
  return {
    localInvestigations: state.localInvestigations
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onDeleteInvestigation: investigation =>
      dispatch(deleteInvestigation(investigation)),
    onDownloadInvestigation: id => dispatch(fetchInvestigationById(id))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  LocalInvestigationsComponent
);
