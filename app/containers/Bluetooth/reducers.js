import {
  BLUETOOTH_STARTED,
  CONNECT_DEVICE_SUCCESS,
  DISCONNECT_DEVICE_SUCCESS,
  UPDATE_DEVICE_SUCCESS
} from "./constants";

const initialBluetoothState = {
  connectedDevices: {},
  started: false
};

export function bluetoothReducer(initial = initialBluetoothState, action) {
  const { device, started } = action;
  const connectedDevices = initial.connectedDevices;
  switch (action.type) {
    case CONNECT_DEVICE_SUCCESS:
    case UPDATE_DEVICE_SUCCESS:
      const devices = {};
      devices[device.id] = {
        ...device
      };

      return {
        ...initial,
        connectedDevices: {
          ...connectedDevices,
          ...devices
        },
        started: initial.started
      };

    case BLUETOOTH_STARTED:
      return {
        ...initial,
        started: started
      };

    case DISCONNECT_DEVICE_SUCCESS:
      delete connectedDevices[device.id];
      return {
        connectedDevices: {
          ...connectedDevices
        },
        started: initial.started
      };

    default:
      return {
        ...initial
      };
  }
}
