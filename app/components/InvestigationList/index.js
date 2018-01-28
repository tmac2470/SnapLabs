import React, { Component } from "react";

import {
  Alert,
  FlatList,
  Image,
  Platform,
  TouchableOpacity,
  View
} from "react-native";
import { Button, H3, H4, H5 } from "nachos-ui";

import Colors from "../../Theme/colors";

export class InvestigationList extends Component<{}> {
  _keyExtractor = (item, index) => item._id;

  _onDeleteInvestigation(investigation) {
    const { onDeleteInvestigation } = this.props;

    Alert.alert(
      "Confirm deletion",
      `This will delete the investigation "${
        investigation.labTitle
      }" from device`,
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
        { text: "Delete", onPress: () => onDeleteInvestigation(investigation) }
      ],
      { cancelable: false }
    );
  }

  _renderInvestigation = ({ item }) => {
    const {
      onDownloadInvestigation,
      investigations,
      navigation,
      expandInvestigation,
      extraData,
      refreshing,
      localInvestigations
    } = this.props;
    const { expand } = extraData;

    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => expandInvestigation(item)}
      >
        <H4 style={styles.labTitle}>{item.labTitle}</H4>

        {!expand[item._id] ? null : (
          <View>
            {item.createdBy && item.createdBy.email ? (
              <H5 style={styles.info}>
                Creater's Email: {item.createdBy.email}
              </H5>
            ) : null}

            {item.description ? (
              <H5 style={styles.info}>Description: {item.description}</H5>
            ) : null}
            {item.lastUpdatedAt ? (
              <H5 style={styles.info}>Updated At: {item.lastUpdatedAt}</H5>
            ) : null}

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
                  disabled={refreshing}
                  onPressIn={() =>
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
                  disabled={!!item.isLocal || refreshing}
                  uppercase={false}
                  onPressIn={() => onDownloadInvestigation(item._id)}
                  style={styles.button}
                >
                  Update
                </Button>

                <Button
                  type="danger"
                  disabled={!!item.isLocal || refreshing}
                  uppercase={false}
                  onPressIn={() => this._onDeleteInvestigation(item)}
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

  render() {
    const {
      investigations,
      extraData,
      refreshing,
      onFetchInvestigations
    } = this.props;

    return (
      <View style={styles.container}>
        <FlatList
          style={styles.list}
          data={investigations}
          onRefresh={onFetchInvestigations}
          refreshing={!!refreshing}
          extraData={extraData}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderInvestigation}
        />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 4
  },
  createdBy: {
    color: Colors.secondary
  },
  listItem: {
    borderBottomColor: "black",
    backgroundColor: "white",
    borderBottomWidth: 0.5,
    paddingLeft: 10,
    paddingRight: 10,
    minHeight: 50,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  info: {
    color: Colors.secondary,
    fontWeight: "500"
  },
  labTitle: {
    color: Colors.primary,
    fontWeight: "600"
  },
  button: {
    width: "100%",
    marginBottom: 10
  }
};

export default InvestigationList;
