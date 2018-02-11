import { APP_ERROR, APP_ERROR_SEEN, APP_BUSY } from './constants';

export function appError(error) {
  return {
    type: APP_ERROR,
    error
  };
}

export function appErrorSeen(errorSeen) {
  return {
    type: APP_ERROR_SEEN,
    errorSeen
  };
}

export function appBusy(busy) {
  return {
    type: APP_BUSY,
    busy
  };
}
