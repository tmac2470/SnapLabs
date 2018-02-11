import React, { Component } from 'react';
import { View, Alert } from 'react-native';
import { connect } from 'react-redux';

import { appErrorSeen } from '../../Metastores/actions';

export class GlobalErrorAlert extends Component<{}> {
  dismiss() {
    this.props.onAppErrorSeen(true);
  }

  shouldShowError(error) {
    if (!error) {
      return false;
    }

    switch (error.toLowerCase()) {
      case 'destroyed':
        return false;

      default:
        break;
    }
  }

  render() {
    const { visible, error } = this.props;

    const showMessage = visible && this.shouldShowError(error);

    return (
      <View>
        {visible
          ? Alert.alert(
              'Error',
              error,
              [
                {
                  text: 'Cancel',
                  onPress: () => this.dismiss(),
                  style: 'cancel'
                },
                { text: 'OK', onPress: () => this.dismiss() }
              ],
              { cancelable: false }
            )
          : null}
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    visible: !state.meta.errorSeen,
    error: state.meta.error
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onAppErrorSeen: seen => dispatch(appErrorSeen(seen))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GlobalErrorAlert);
