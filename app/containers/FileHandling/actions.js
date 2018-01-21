import RNFS from 'react-native-fs';
import {FETCH_FILES_SUCCESS, SAVE_FILE_SUCCESS, DELETE_FILE_SUCCESS} from './constants';
import {networkBusy, networkError} from "../../Metastores/actions";
import {Platform} from 'react-native';

export function fetchFilesSuccess(files) {
  return {type: FETCH_FILES_SUCCESS, files};
}

export function saveFileSuccess(file) {
  return {type: SAVE_FILE_SUCCESS, file};
}

export function deleteFileSuccess(file) {
  return {type: DELETE_FILE_SUCCESS, file};
}

export const _getFolderPath = (user) => {
  let folder = '';
  if (Platform.OS === 'ios') {
    folder = RNFS.LibraryDirectoryPath;
  } else {
    folder = RNFS.ExternalDirectoryPath;
  }

  return `${folder}/${user.email}`;
}

export const fetchFiles = (user) => {
  return dispatch => {
    dispatch(networkBusy(true));
    return RNFS
      .readDir(_getFolderPath(user))
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

export const saveFile = (fileName, fileContent, user) => {
  const path = `${_getFolderPath(user)}`;
  const filePath = `${path}/${fileName}`;
  return dispatch => {
    dispatch(networkBusy(true));

    return RNFS
      .mkdir(path)
      .then(e => {
        return RNFS
          .writeFile(filePath, fileContent)
          .then(_ => {
            console.log('saved file', fileName);
            // dispatch(saveFileSuccess(files));
            dispatch(networkBusy(false));
          })
          .catch(error => {
            dispatch(networkError(error.message));
            dispatch(networkBusy(false));
          });
      })
      .catch(error => {
        dispatch(networkError(error.message));
        dispatch(networkBusy(false));
      })
  }
}

export const deleteFile = (file, user) => {
  const fileName = file.name;
  const filePath = `${_getFolderPath(user)}/${fileName}`;

  return dispatch => {
    dispatch(networkBusy(true));

    return RNFS
      .unlink(filePath)
      .then(_ => {
        console.log('deleted', fileName);
        dispatch(deleteFileSuccess(file));
        dispatch(networkBusy(false));
      })
      .catch(error => {
        dispatch(networkError(error.message));
        dispatch(networkBusy(false));
      });
  }
}