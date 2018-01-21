import {FETCH_FILES_SUCCESS, SAVE_FILE_SUCCESS, DELETE_FILE_SUCCESS} from './constants';

const initialFileState = [];

export function fileHandlingReducer(initial = initialFileState, action) {
  const {file, files, type} = action;
  switch (type) {
    case FETCH_FILES_SUCCESS:
      return [...files];
    case DELETE_FILE_SUCCESS:
      const remFiles = initial.filter(f => f.name !== file.name);
      return [...remFiles];
    default:
      return [...initial];
  }
}