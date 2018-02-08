import axios from 'axios';
import {
  FETCH_INVESTIGATIONS_SUCCESS,
  SET_FETCH_INVESTIGATIONS_FILTERS
} from './constants';
import { API_PATH } from '../../../constants';
import { appBusy, appError } from '../../../Metastores/actions';
import { stringify } from 'query-string';

export function fetchInvestigationsSuccess(investigations) {
  return {
    type: FETCH_INVESTIGATIONS_SUCCESS,
    investigations
  };
}

export function updateFetchInvestigationsFilters(filters) {
  return {
    type: SET_FETCH_INVESTIGATIONS_FILTERS,
    filters
  };
}

export const fetchInvestigations = params => {
  const queryString = stringify(params);
  const apiUrl = `${API_PATH}/experiments?${queryString}`;

  // Returns a dispatcher function
  // that dispatches an action at a later time
  return dispatch => {
    dispatch(appBusy(true));
    dispatch(updateFetchInvestigationsFilters(params));
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
