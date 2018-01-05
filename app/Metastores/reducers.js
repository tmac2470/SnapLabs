import { NETWORK_ERROR, NETWORK_FETCHING } from "./constants";

const initialMetastoreState = {
  isFetching: false,
  error: null
};

export function metaStoreReducer(initial = initialMetastoreState, action) {
  const { isFetching, error } = action;

  switch (action.type) {
    case NETWORK_ERROR:
      return {
        ...initial,
        error
      };
    case NETWORK_FETCHING:
      return {
        ...initial,
        isFetching
      };

    default:
      return {
        ...initial
      };
  }
}
