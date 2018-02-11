import {
  FETCH_INVESTIGATIONS_SUCCESS,
  SET_FETCH_INVESTIGATIONS_FILTERS
} from './constants';

const initialDownloadInvestigationsState = {
  list: {},
  filters: {
    afterDate: '2016-12-01',
    beforeDate: new Date(),
    fields: 'all',
    query: '',
    sort: '-lastupdated'
  }
};

export function downloadInvestigationsReducer(
  initial = initialDownloadInvestigationsState,
  action
) {
  const { investigations, filters } = action;

  switch (action.type) {
    case FETCH_INVESTIGATIONS_SUCCESS:
      investigations.map(investigation => {
        initial.list[investigation._id] = investigation;
      });
      if (!investigations || investigations.length <= 0) {
        initial.list = {};
      }
      return { ...initial, list: { ...initial.list } };

    case SET_FETCH_INVESTIGATIONS_FILTERS:
      return { ...initial, filters: { ...filters } };

    default:
      return { ...initial };
  }
}
