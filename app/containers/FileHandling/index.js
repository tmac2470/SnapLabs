import React, {Component} from "react";
import {connect} from "react-redux";
import FullScreenLoader from '../../components/FullScreenLoading';

import {View, FlatList, TouchableOpacity, Alert, Share} from "react-native";
import {Button, H2, H3, H4} from "nachos-ui";

import Colors from "../../Theme/colors";

import {fetchFiles, deleteFile, _getFolderPath} from './actions';
import {appError} from '../../Metastores/actions';

export class FileHandlingComponent extends Component < {} > {
  static navigationOptions = {
    title: "Saved Files"
  };

  state = {
    expand: {},
    filePath: ''
  }

  _keyExtractor = (item, index) => item.name;

  _onExpandFileItem(file) {
    const {expand} = this.state;
    this.setState({
      expand: {
        [file.name]: !expand[file.name]
      }
    });
  }

  componentWillMount() {
    const {onFetchFiles, user} = this.props;
    onFetchFiles(user);
    const filePath = _getFolderPath(user);
    this.setState({filePath});
  }

  _onDeleteFile(file) {
    const {onDeleteFile, user} = this.props;

    Alert.alert("Confirm deletion", `This will delete the file "${file.name}" from device`, [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel"
      }, {
        text: "Delete",
        onPress: () => onDeleteFile(file, user)
      }
    ], {cancelable: true});
  }

  onShareFile(file) {
    const {onAppError} = this.props;
    Share.share({
      title: "Snaplabs: Experiment data file " + file.name,
      message: "Snaplabs: Experiment data file " + file.name,
      url: file.path
    }, {
        dialogTitle: "Snaplabs: Experiment data file " + file.name
      })
      .then(e => {
      // success
    })
      .catch(e => {
        onAppError(e.message);
      });
  }

  _renderFileItem = ({item}) => {
    const {expand} = this.state;

    return (
      <TouchableOpacity
        style={styles.listItem}
        onPressIn={() => this._onExpandFileItem(item)}>
        <H4 style={styles.name}>{item.name}</H4>
        {!expand[item.name]
          ? null
          : (
            <View>
              <Button
                type="success"
                uppercase={false}
                onPressIn={() => this.onShareFile(item)}
                style={styles.button}>
                Share
              </Button>

              <Button
                type="danger"
                uppercase={false}
                onPressIn={() => this._onDeleteFile(item)}
                style={styles.button}>
                Delete
              </Button>
            </View>
          )}
      </TouchableOpacity>
    )
  }

  render() {
    const {files, busy} = this.props;
    const {filePath} = this.state;
    const filteredFiles = files.filter(file => {
      return file.isFile() && file
        .name
        .indexOf('.csv') > -1;
    });

    return (
      <View style={styles.container}>
        <FullScreenLoader visible={!!busy}/>
        <View style={styles.textContainer}>
          <H4 style={styles.info}>Files are stored under: {filePath}</H4>
        </View>
        <FlatList
          style={styles.list}
          data={filteredFiles}
          refreshing={false}
          extraData={this.state}
          keyExtractor={this._keyExtractor}
          renderItem={this
          ._renderFileItem
          .bind(this)}/>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 4
  },
  textContainer: {
    display: "flex",
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: Colors.white,
    borderBottomColor: "black",
    borderBottomWidth: 0.5
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
  return {files: state.localFiles, user: state.currentUser, busy: state.meta.busy};
};

const mapDispatchToProps = dispatch => {
  return {
    onFetchFiles: (user) => dispatch(fetchFiles(user)),
    onDeleteFile: (file, user) => dispatch(deleteFile(file, user)),
    onAppError: error => dispatch(appError(error))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FileHandlingComponent);
