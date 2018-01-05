import axios from "axios";
import { FETCH_INVESTIGATIONS_SUCCESS } from "./constants";
import { API_PATH } from "../../../constants";
import { networkBusy, networkError } from "../../../Metastores/actions";

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
    dispatch(networkBusy(true));
    // Returns a promise
    return axios
      .get(apiUrl)
      .then(response => {
        // Dispatch another action
        // to consume data
        dispatch(fetchInvestigationsSuccess(response.data.data));
        dispatch(networkBusy(false));
      })
      .catch(error => {
        dispatch(networkError(error.message));
        dispatch(networkBusy(false));
      });
  };
};
