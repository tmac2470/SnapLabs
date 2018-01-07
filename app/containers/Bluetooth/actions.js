import {
  BLUETOOTH_STARTED,
  CONNECT_DEVICE_SUCCESS,
  DISCONNECT_DEVICE_SUCCESS,
  UPDATE_DEVICE_SUCCESS
} from "./constants";

export function updateConnectedDevice(device) {
  return {
    type: UPDATE_DEVICE_SUCCESS,
    device
  };
}

export function bluetoothStart(started) {
  return {
    type: BLUETOOTH_STARTED,
    started
  };
}

export function deviceConnect(device) {
  return {
    type: CONNECT_DEVICE_SUCCESS,
    device
  };
}

export function deviceDisconnect(device) {
  return {
    type: DISCONNECT_DEVICE_SUCCESS,
    device
  };
}
