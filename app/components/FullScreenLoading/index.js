import React, {Component} from 'react';
import {StyleSheet, View, Modal, ActivityIndicator} from 'react-native';
import Spinner from "react-native-spinkit";
import Colors from "../../Theme/colors";


const FullScreenLoader = props => {
  const {
    visible
  } = props;

  return (
    <Modal
      transparent={true}
      animationType={'fade'}
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.modalBackground}>
        <Spinner type={'FadingCircle'} size={50} color={Colors.secondary}/>
      </View>
    </Modal>
  )
}

// <ActivityIndicator animating={visible} size={'large'}/>

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: Colors.backgroundBlurColor
  }
});

export default FullScreenLoader;