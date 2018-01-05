import {
  FETCH_INVESTIGATIONS,
  FETCH_INVESTIGATIONS_FAILED,
  FETCH_INVESTIGATIONS_SUCCESS
} from "./constants";

const initialInvestigationsState = {
  investigations: [],
  isFetching: false
};

export function downloadInvestigationsReducer(
  initial = initialInvestigationsState,
  action
) {
  const { isFetching, investigations, error } = action;

  switch (action.type) {
    case FETCH_INVESTIGATIONS:
      return {
        ...initial,
        isFetching,
        investigations
      };

    case FETCH_INVESTIGATIONS_SUCCESS:
      return {
        ...initial,
        isFetching,
        investigations
      };

    case FETCH_INVESTIGATIONS_FAILED:
      return {
        ...initial,
        isFetching,
        error
      };

    default:
      return {
        ...initial
      };
  }
}
