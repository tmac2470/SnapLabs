import { APP_ERROR, APP_ERROR_SEEN, APP_BUSY } from './constants';

const initialMetastoreState = {
  busy: false,
  error: null,
  errorSeen: true
};

export function metaStoreReducer(initial = initialMetastoreState, action) {
  const { busy, error, errorSeen } = action;

  switch (action.type) {
    case APP_ERROR_SEEN:
      return Object.assign({}, initial, { errorSeen, error: null });
    case APP_ERROR:
      return Object.assign({}, initial, { error, errorSeen: false });
    case APP_BUSY:
      return Object.assign({}, initial, { busy });

    default:
      return {
        ...initial
      };
  }
}
