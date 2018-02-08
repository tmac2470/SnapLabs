import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Modal, Text, TextInput } from 'react-native';
import InvestigationList from '../../../components/InvestigationList';
import FullScreenLoader from '../../../components/FullScreenLoading';

import Colors from '../../../Theme/colors';
import { fetchInvestigations } from './actions';
import { fetchInvestigationById, deleteInvestigation } from '../Local/actions';
import { Button, H5, H4, H6, Input } from 'nachos-ui';

export class DownloadInvestigationsComponent extends Component<{}> {
  static navigationOptions = {
    title: 'Download Investigations'
  };

  state = {
    expand: {},
    filterModalVisible: false,
    filters: {}
  };

  _onExpandInvestigation(investigation) {
    const { expand } = this.state;
    this.setState({
      expand: { [investigation._id]: !expand[investigation._id] }
    });
  }

  componentDidMount() {
    const { onFetchInvestigations } = this.props;
    const { filters } = this.props;
    onFetchInvestigations(filters);
  }

  _convertObjectToArray = obj => {
    return Object.keys(obj).map(function(key) {
      return obj[key];
    });
  };

  updateFilters(newFilters) {
    const { filters } = this.state;
    this.setState({
      filters: {
        ...filters,
        ...newFilters
      }
    });
  }

  openModal() {
    const { filters } = this.props;
    this.setState({ filterModalVisible: true, filters });
  }

  applyFilters() {
    const { filters } = this.state;
    const { onFetchInvestigations } = this.props;
    this.closeModal();

    setTimeout(() => {
      onFetchInvestigations(filters);
    }, 500);
  }

  closeModal() {
    this.setState({ filterModalVisible: false });
  }

  resetFilters() {
    this.setState({
      filters: {}
    });
  }

  render() {
    const {
      investigations,
      isBusy,
      localInvestigations,
      navigation,
      onDeleteInvestigation,
      onDownloadInvestigation,
      onFetchInvestigations
    } = this.props;

    const { filters } = this.state;

    const investigationsArray = this._convertObjectToArray(investigations);

    return (
      <View style={styles.container}>
        <FullScreenLoader visible={!!isBusy} />
        <InvestigationList
          style={styles.list}
          investigations={investigationsArray}
          localInvestigations={localInvestigations}
          onRefresh={onFetchInvestigations}
          extraData={this.state}
          onDownloadInvestigation={onDownloadInvestigation}
          navigation={navigation}
          onDeleteInvestigation={onDeleteInvestigation}
          expandInvestigation={this._onExpandInvestigation.bind(this)}
        />

        <Modal
          visible={this.state.filterModalVisible}
          animationType={'slide'}
          onRequestClose={() => this.closeModal()}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Button
                iconName="md-close"
                iconColor={Colors.primary}
                onPressIn={() => this.closeModal()}
                style={styles.closeButton}
              />

              <Button
                type="danger"
                uppercase={false}
                onPressIn={() => this.resetFilters()}
                style={styles.resetButton}
              >
                Reset
              </Button>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.filterList}>
                <Input
                  inputStyle={styles.inputText}
                  placeholder="Query"
                  autoCorrect={false}
                  autoFocus={true}
                  onChangeText={query => this.updateFilters({ query })}
                  value={filters.query}
                />
              </View>

              <View style={styles.footerButtonContainer}>
                <Button
                  uppercase={false}
                  disabled={!!isBusy}
                  style={styles.footerButton}
                  onPressIn={() => this.applyFilters()}
                >
                  Apply Filters
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.footerButtonContainer}>
          <Button
            disabled={!!isBusy}
            uppercase={false}
            onPressIn={() => this.openModal()}
            style={styles.footerButton}
            iconName={isBusy ? 'ios-checkmark-circle' : ''}
          >
            Filters
          </Button>
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flexDirection: 'column',
    flex: 1
  },
  inputText: {
    fontSize: 18
  },
  modalContainer: {
    flex: 1,
    paddingTop: 5,
    flexDirection: 'column'
  },
  modalContent: {
    flex: 1,
    padding: 15,
    flexDirection: 'column'
  },
  list: {
    flex: 4
  },
  filterList: {
    flex: 4
  },
  footerButtonContainer: {
    flex: 1,
    maxHeight: 60,
    padding: 10
  },
  footerButton: {
    width: '100%'
  },
  filterLabel: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    marginTop: 10,
    paddingRight: 10,
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderColor: Colors.primary
  },
  resetButton: {
    width: 50,
    height: 30,
    alignSelf: 'flex-end'
  },
  closeButton: {
    width: 10,
    height: 30,
    backgroundColor: 'transparent'
  }
};

const mapStateToProps = state => {
  return {
    investigations: state.downloadInvestigations.list,
    isBusy: state.meta.busy,
    localInvestigations: state.localInvestigations,
    filters: state.downloadInvestigations.filters
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onDeleteInvestigation: investigation =>
      dispatch(deleteInvestigation(investigation)),
    onFetchInvestigations: filters => dispatch(fetchInvestigations(filters)),
    onDownloadInvestigation: id => dispatch(fetchInvestigationById(id))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  DownloadInvestigationsComponent
);
