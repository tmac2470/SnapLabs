import {
  DOWNLOAD_INVESTIGATION_SUCCESS,
  DELETE_INVESTIGATION_SUCCESS
} from "./constants";

const initialLocalInvestigationsState = [];

export function localInvestigationsReducer(
  initial = initialLocalInvestigationsState,
  action
) {
  const { investigation } = action;

  switch (action.type) {
    case DOWNLOAD_INVESTIGATION_SUCCESS:
      return [...initial, investigation];

    case DELETE_INVESTIGATION_SUCCESS:
      initial = initial.filter(i => i._id !== investigation._id);
      return [...initial];

    default:
      return {
        ...initial
      };
  }
}
