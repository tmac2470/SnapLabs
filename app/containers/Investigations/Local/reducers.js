import {
  DOWNLOAD_INVESTIGATION_SUCCESS,
  DELETE_INVESTIGATION
} from "./constants";

const initialLocalInvestigationsState = {};

export function localInvestigationsReducer(
  initial = initialLocalInvestigationsState,
  action
) {
  const { investigation } = action;

  switch (action.type) {
    case DOWNLOAD_INVESTIGATION_SUCCESS:
      initial[investigation._id] = investigation;
      return {
        ...initial
      };

    case DELETE_INVESTIGATION:
      delete initial[investigation._id];
      return {
        ...initial
      };

    default:
      return {
        ...initial
      };
  }
}
