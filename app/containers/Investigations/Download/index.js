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

export class DownloadInvestigationsComponent extends Component<{}> {
  static navigationOptions = {
    title: "Download Investigations"
  };

  state = {
    expand: {}
  };

  componentWillMount() {
    const { onFetchInvestigations } = this.props;
    onFetchInvestigations();
  }

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
        <H5 style={styles.createdBy}>Created by: {item.createdBy.name}</H5>

        {!expand[item._id] ? null : (
          <View>
            <H5 style={styles.info}>Creater's Email: {item.createdBy.email}</H5>
            <H5 style={styles.info}>Updated At: {item.lastUpdatedAt}</H5>
            <H5 style={styles.info}>Description: {item.description}</H5>

            {!localInvestigations[item._id] ? (
              <Button
                type="success"
                uppercase={false}
                onPress={() => onDownloadInvestigation(item._id)}
                style={styles.button}
              >
                Download
              </Button>
            ) : (
              <View>
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
          </View>
        )}
      </TouchableOpacity>
    );
  };

  _keyExtractor = (item, index) => item._id;

  render() {
    // https://dev-blog.apollodata.com/loading-data-into-react-natives-flatlist-9646fa9a199b
    const { investigations, isFetching, onFetchInvestigations } = this.props;
    return (
      <View style={styles.container}>
        <H3 style={styles.header}>Select an investigation to download</H3>
        <FlatList
          data={investigations}
          onRefresh={onFetchInvestigations}
          refreshing={!!isFetching}
          extraData={this.state}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderInvestigation}
        />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1
  },
  listItem: {
    borderBottomColor: "black",
    backgroundColor: "white",
    borderBottomWidth: 0.5,
    paddingLeft: 15,
    paddingRight: 15
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
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
  },
  header: {
    color: Colors.secondary,
    fontWeight: "600",
    padding: 15
  }
};

const mapStateToProps = state => {
  return {
    investigations: state.downloadInvestigations,
    isFetching: state.meta.isFetching,
    localInvestigations: state.localInvestigations
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onDeleteInvestigation: investigation =>
      dispatch(deleteInvestigation(investigation)),
    onFetchInvestigations: _ => dispatch(fetchInvestigations()),
    onDownloadInvestigation: id => dispatch(fetchInvestigationById(id))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  DownloadInvestigationsComponent
);
