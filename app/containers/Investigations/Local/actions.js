import axios from "axios";
import {
  DOWNLOAD_INVESTIGATION_SUCCESS,
  DELETE_INVESTIGATION
} from "./constants";
import { API_PATH } from "../../../constants";
import { networkBusy, networkError } from "../../../Metastores/actions";

export function downloadInvestigationSuccess(investigation) {
  return {
    type: DOWNLOAD_INVESTIGATION_SUCCESS,
    investigation
  };
}

export function deleteInvestigation(investigation) {
  return {
    type: DELETE_INVESTIGATION,
    investigation
  };
}

export const fetchInvestigationById = Id => {
  const apiUrl = `${API_PATH}/experiments/${Id}`;
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
        dispatch(downloadInvestigationSuccess(response.data.data));
        dispatch(networkBusy(false));
      })
      .catch(error => {
        dispatch(networkError(error.message));
        dispatch(networkBusy(false));
      });
  };
};
