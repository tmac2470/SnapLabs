import React, { Component } from "react";
import { connect } from "react-redux";

import { View, FlatList, TouchableOpacity, Alert } from "react-native";
import { Button, H2, H4 } from "nachos-ui";

import Colors from "../../../Theme/colors";

import { fetchFiles, deleteFile } from '../../FileHandling/actions';

export class SavedInvestigationsComponent extends Component<{}> {
  static navigationOptions = {
    title: "Saved Files"
  };

  state = {
    expand: {}
  }

  _keyExtractor = (item, index) => item.name;

  _onExpandFileItem(file) {
    const { expand } = this.state;
    this.setState({
      expand: { [file.name]: !expand[file.name] }
    });
  }

  componentWillMount() {
    const { onFetchFiles } = this.props;
    onFetchFiles();
  }

  _onDeleteFile(file) {
    const { onDeleteFile } = this.props;

    Alert.alert(
      "Confirm deletion",
      `This will delete the file "${
        file.name
      }" from device`,
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
        { text: "Delete", onPress: () => onDeleteFile(file) }
      ],
      { cancelable: true }
    );
  }

  _renderFileItem= ({ item }) => {
    const { expand } = this.state;

    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => this._onExpandFileItem(item)}
      >
        <H4 style={styles.name}>{item.name}</H4>
        {!expand[item.name] ? null : (
          <View>
            <Button
              type="success"
              uppercase={false}
              onPress={() => onDownloadInvestigation(item._id)}
              style={styles.button}
            >
              Share
            </Button>

            <Button
              type="danger"
              uppercase={false}
              onPress={() => this._onDeleteFile(item)}
              style={styles.button}
            >
              Delete
            </Button>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  render() {
    const { files } = this.props;
    const filteredFiles = files.filter(file => {
      return file.isFile() && file.name.indexOf('.csv') > -1;
    });

    return (
      <View style={styles.container}>
        <FlatList
          style={styles.list}
          data={filteredFiles}
          refreshing={false}
          extraData={this.state}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderFileItem.bind(this)}
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
  name: {
    color: Colors.primary,
    fontWeight: "600"
  },
  button: {
    width: "100%",
    marginBottom: 10
  }
};

const mapStateToProps = state => {
  return {
    files: state.localFiles
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onFetchFiles: () => dispatch(fetchFiles()),
    onDeleteFile: file=> dispatch(deleteFile(file))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SavedInvestigationsComponent);
