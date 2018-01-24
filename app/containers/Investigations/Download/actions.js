import axios from "axios";
import { FETCH_INVESTIGATIONS_SUCCESS } from "./constants";
import { API_PATH } from "../../../constants";
import { appBusy, appError } from "../../../Metastores/actions";

export function fetchInvestigationsSuccess(investigations) {
  return {
    type: FETCH_INVESTIGATIONS_SUCCESS,
    investigations
  };
}

export const fetchInvestigations = () => {
  const apiUrl = `${API_PATH}/experiments`;
  // Returns a dispatcher function
  // that dispatches an action at a later time
  return dispatch => {
    dispatch(appBusy(true));
    // Returns a promise
    return axios
      .get(apiUrl)
      .then(response => {
        // Dispatch another action
        // to consume data
        dispatch(fetchInvestigationsSuccess(response.data.data));
        dispatch(appBusy(false));
      })
      .catch(error => {
        dispatch(appError(error.message));
        dispatch(appBusy(false));
      });
  };
};
