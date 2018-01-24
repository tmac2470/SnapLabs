import React, { Component } from "react";
import { connect } from "react-redux";
import { View } from "react-native";
import InvestigationList from "../../../components/InvestigationList";
import FullScreenLoader from '../../../components/FullScreenLoading';

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

  _onExpandInvestigation(investigation) {
    const { expand } = this.state;
    this.setState({
      expand: { [investigation._id]: !expand[investigation._id] }
    });
  }

  componentWillMount() {
    const { onFetchInvestigations } = this.props;
    onFetchInvestigations();
  }

  _convertObjectToArray = obj => {
    return Object.keys(obj).map(function(key) {
      return obj[key];
    });
  };


  render() {
    const {
      investigations,
      isFetching,
      localInvestigations,
      navigation,
      onDeleteInvestigation,
      onDownloadInvestigation,
      onFetchInvestigations
    } = this.props;

    const investigationsArray = this._convertObjectToArray(
      investigations
    );

    return (
      <View style={styles.container}>
        <FullScreenLoader visible={!!isFetching}/>
        <InvestigationList
          investigations={investigationsArray}
          localInvestigations={localInvestigations}
          onRefresh={onFetchInvestigations}
          extraData={this.state}
          onDownloadInvestigation={onDownloadInvestigation}
          navigation={navigation}
          onDeleteInvestigation={onDeleteInvestigation}
          expandInvestigation={this._onExpandInvestigation.bind(this)}
        />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1
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
