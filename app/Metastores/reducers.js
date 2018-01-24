import { APP_ERROR, APP_BUSY } from "./constants";

const initialMetastoreState = {
  busy: false,
  error: null
};

export function metaStoreReducer(initial = initialMetastoreState, action) {
  const { busy, error } = action;

  switch (action.type) {
    case APP_ERROR:
      return {
        ...initial,
        error
      };
    case APP_BUSY:
      return {
        ...initial,
        busy
      };

    default:
      return {
        ...initial
      };
  }
}
