import {
  BLUETOOTH_STARTED,
  DISCONNECT_DEVICE_SUCCESS,
  CONNECT_DEVICE_SUCCESS
} from "./constants";

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
