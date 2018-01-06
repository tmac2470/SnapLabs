import React, { Component } from "react";
import { connect } from "react-redux";

import {
  View,
  TouchableOpacity,
  Image,
  Platform,
  FlatList
} from "react-native";
import { Button, H3, H4, H5 } from "nachos-ui";
import Spinner from "react-native-spinkit";

import Colors from "../../../Theme/colors";
import { fetchInvestigations } from "./actions";
import { fetchInvestigationById, deleteInvestigation } from "../Local/actions";

export class LocalInvestigationsComponent extends Component<{}> {
  static navigationOptions = {
    title: "Local Investigations"
  };

  state = {
    expand: {}
  };

  _renderInvestigation = ({ item }) => {
    const { expand } = this.state;
    const {
      onDownloadInvestigation,
      localInvestigations,
      onDeleteInvestigation,
      navigation
    } = this.props;
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() =>
          this.setState({ expand: { [item._id]: !expand[item._id] } })
        }
      >
        <H4 style={styles.labTitle}>{item.labTitle}</H4>

        {!expand[item._id] ? null : (
          <View>
            <H5 style={styles.info}>Description: {item.description}</H5>
            <H5 style={styles.info}>Updated At: {item.lastUpdatedAt}</H5>

            <Button
              type="success"
              uppercase={false}
              onPress={() =>
                navigation.navigate("InvestigationDetails", {
                  investigation: localInvestigations[item._id]
                })
              }
              style={styles.button}
            >
              Open
            </Button>

            <Button
              type="success"
              uppercase={false}
              onPress={() => onDownloadInvestigation(item._id)}
              style={styles.button}
            >
              Update
            </Button>

            <Button
              type="danger"
              uppercase={false}
              onPress={() => onDeleteInvestigation(item)}
              style={styles.button}
            >
              Delete
            </Button>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  _keyExtractor = (item, index) => item._id;

  _convertObjectToArray = obj => {
    return Object.keys(obj).map(function(key) {
      return obj[key];
    });
  };

  render() {
    // https://dev-blog.apollodata.com/loading-data-into-react-natives-flatlist-9646fa9a199b
    const { localInvestigations, isFetching, navigation } = this.props;
    const localInvestigationsArray = this._convertObjectToArray(
      localInvestigations
    );

    return (
      <View style={styles.container}>
        <H3 style={styles.header}>Select an investigation</H3>
        <FlatList
          style={styles.list}
          data={localInvestigationsArray}
          refreshing={!!isFetching}
          extraData={this.state}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderInvestigation}
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
  list: {
    flex: 4
  },
  header: {
    color: Colors.secondary,
    fontWeight: "600",
    padding: 15,
    flex: 1
  },
  footerButtonContainer: {
    flex: 1,
    maxHeight: 40
  },
  footerButton: {
    width: "100%",
    borderRadius: 0,
    maxHeight: 40
  },
  listItem: {
    borderBottomColor: "black",
    backgroundColor: "white",
    borderBottomWidth: 0.5,
    paddingLeft: 10,
    paddingRight: 10
  },
  labTitle: {
    color: Colors.primary,
    fontWeight: "600"
  },
  createdBy: {
    color: Colors.secondary
  },
  info: {
    color: Colors.secondary,
    fontWeight: "500"
  },
  button: {
    width: "100%",
    maxHeight: 30
  }
};

const mapStateToProps = state => {
  return {
    isFetching: state.meta.isFetching,
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
