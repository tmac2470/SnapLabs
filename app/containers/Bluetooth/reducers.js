import {
  BLUETOOTH_STARTED,
  DISCONNECT_DEVICE_SUCCESS,
  CONNECT_DEVICE_SUCCESS
} from "./constants";

const initialBluetoothState = {
  connectedDevices: {},
  started: false
};

export function bluetoothReducer(initial = initialBluetoothState, action) {
  const { device, started } = action;
  const connectedDevices = initial.connectedDevices;
  switch (action.type) {
    case BLUETOOTH_STARTED:
      return {
        ...initial,
        started
      };

    case CONNECT_DEVICE_SUCCESS:
      connectedDevices[device.id] = device;
      return {
        ...initial,
        connectedDevices
      };

    case DISCONNECT_DEVICE_SUCCESS:
      delete connectedDevices[device.id];
      return {
        ...initial,
        connectedDevices
      };

    default:
      return {
        ...initial
      };
  }
}
