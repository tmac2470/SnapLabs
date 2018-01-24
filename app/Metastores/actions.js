import { APP_ERROR, APP_BUSY } from "./constants";

export function appError(error) {
  return {
    type: APP_ERROR,
    error
  };
}

export function appBusy(busy) {
  return {
    type: APP_BUSY,
    busy
  };
}
