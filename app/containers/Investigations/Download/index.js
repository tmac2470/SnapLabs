import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Modal, Text, Picker, TouchableOpacity } from 'react-native';
import InvestigationList from '../../../components/InvestigationList';
import FullScreenLoader from '../../../components/FullScreenLoading';
import DatePicker from 'react-native-datepicker';

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
    const propFilters = this.props.filters;
    const filtersSelected =
      Object.keys(propFilters).filter(key => !!propFilters[key]).length > 0;

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
                <H5 style={styles.text}>Keywords</H5>
                <Input
                  inputStyle={styles.inputText}
                  placeholder="Query"
                  autoCorrect={false}
                  autoFocus={true}
                  onChangeText={query => this.updateFilters({ query })}
                  value={filters.query}
                />

                <H5 style={styles.text}>Filter from</H5>

                <DatePicker
                  date={filters.afterDate}
                  mode="date"
                  style={styles.datepicker}
                  placeholder="From date"
                  maxDate={filters.beforeDate || new Date()}
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  showIcon={false}
                  onDateChange={afterDate => this.updateFilters({ afterDate })}
                />

                <H5 style={styles.text}>To</H5>

                <DatePicker
                  date={filters.beforeDate}
                  mode="date"
                  style={styles.datepicker}
                  placeholder="To date"
                  maxDate={new Date()}
                  minDate={filters.afterDate}
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  showIcon={false}
                  onDateChange={beforeDate =>
                    this.updateFilters({ beforeDate })
                  }
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
            iconName={filtersSelected ? 'ios-alert-outline' : ''}
          >
            Filters
          </Button>
        </View>
      </View>
    );
  }
}

// <Picker
// selectedValue={filters.sort}
// onValueChange={sort => this.updateFilters({ sort })}
// >
// <Picker.Item label="Created(Asc)" value="createdat" />
// <Picker.Item label="Created(Desc)" value="-createdat" />
// <Picker.Item label="Last Updated(Asc)" value="lastupdated" />
// <Picker.Item label="Last Updated(Desc)" value="-lastupdated" />
// <Picker.Item label="Author(Asc)" value="author" />
// <Picker.Item label="Author(Desc)" value="-author" />

// </Picker>

const styles = {
  container: {
    flexDirection: 'column',
    flex: 1
  },
  inputText: {
    fontSize: 18
  },
  text: {
    fontSize: 18,
    color: Colors.dark
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
  datepicker: {
    width: '100%',
    maxWidth: 500
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
