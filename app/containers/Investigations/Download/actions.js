import axios from "axios";
import {
  FETCH_INVESTIGATIONS,
  FETCH_INVESTIGATIONS_FAILED,
  FETCH_INVESTIGATIONS_SUCCESS
} from "./constants";
import { API_PATH } from "../../../constants";

export function startFetchingInvestigations() {
  return {
    type: FETCH_INVESTIGATIONS,
    isFetching: true
  };
}

export function fetchInvestigationsSuccess(investigations) {
  return {
    type: FETCH_INVESTIGATIONS_SUCCESS,
    investigations,
    isFetching: false
  };
}

export function fetchInvestigationsFailed(error) {
  return {
    type: FETCH_INVESTIGATIONS_FAILED,
    error: error,
    isFetching: false
  };
}

export const fetchInvestigations = () => {
  const apiUrl = `${API_PATH}/experiments`;
  // Returns a dispatcher function
  // that dispatches an action at a later time
  return dispatch => {
    dispatch(startFetchingInvestigations());
    // Returns a promise
    return axios
      .get(apiUrl)
      .then(response => {
        console.log(response);
        // Dispatch another action
        // to consume data
        dispatch(fetchInvestigationsSuccess(response.data));
      })
      .catch(error => {
        dispatch(fetchInvestigationsFailed(error.message));
      });
  };
};
