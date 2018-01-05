import { NETWORK_ERROR, NETWORK_FETCHING } from "./constants";

export function networkError(error) {
  return {
    type: NETWORK_ERROR,
    error
  };
}

export function networkBusy(isFetching) {
  return {
    type: NETWORK_FETCHING,
    isFetching
  };
}
