import RNFS from 'react-native-fetch-blob'
import {FETCH_FILES_SUCCESS, SAVE_FILE_SUCCESS, DELETE_FILE_SUCCESS} from './constants';
import {networkBusy, networkError} from "../../Metastores/actions";
import {Platform} from 'react-native';

const {fs, fetch, wrap} = RNFS;

export function fetchFilesSuccess(files) {
  return {type: FETCH_FILES_SUCCESS, files};
}

export function saveFileSuccess(file) {
  return {type: SAVE_FILE_SUCCESS, file};
}

export function deleteFileSuccess(fileName) {
  return {type: DELETE_FILE_SUCCESS, fileName};
}

const _getFolderPath = () => {
  if (Platform.OS === 'ios') {
    return fs.dirs.DocumentDir;
  } else {
    return fs.dirs.DownloadDir;
  }
}

export const fetchFiles = () => {
  return dispatch => {
    dispatch(networkBusy(true));
    return RNFS
      .readDir(_getFolderPath())
      .then(files => {
        dispatch(fetchFilesSuccess(files));
        dispatch(networkBusy(false));
      })
      .catch(error => {
        dispatch(networkError(error.message));
        dispatch(networkBusy(false));
      });
  }
}

export const saveFile = (fileName, fileContent) => {
  const filePath = `${_getFolderPath()}/${fileName}`;
  return dispatch => {
    dispatch(networkBusy(true));

    return fs
      .writeFile(filePath, fileContent)
      .then(_ => {
        console.log('lol');
        // dispatch(saveFileSuccess(files));
        dispatch(networkBusy(false));
      })
      .catch(error => {
        dispatch(networkError(error.message));
        dispatch(networkBusy(false));
      });
  }
}

export const deleteFile = (fileName) => {
  const filePath = `${_getFolderPath()}/${fileName}`;
  return dispatch => {
    dispatch(networkBusy(true));

    return fs
      .unlink(filePath)
      .then(_ => {
        dispatch(deleteFileSuccess(fileName));
        dispatch(networkBusy(false));
      })
      .catch(error => {
        dispatch(networkError(error.message));
        dispatch(networkBusy(false));
      });
  }
}