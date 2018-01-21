import { FETCH_INVESTIGATIONS_SUCCESS } from "./constants";

const initialDownloadInvestigationsState = {};

export function downloadInvestigationsReducer(
  initial = initialDownloadInvestigationsState,
  action
) {
  const { investigations } = action;

  switch (action.type) {
    case FETCH_INVESTIGATIONS_SUCCESS:
      investigations.map(investigation => {
        initial[investigation._id] = investigation;
      });
      return {...initial};

    default:
      return {...initial};
  }
}
