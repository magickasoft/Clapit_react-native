import {
  FILE_UPLOAD_START,
  FILE_UPLOAD_SUCCESS ,
  FILE_UPLOAD_PROGRESS ,
  FILE_UPLOAD_ERROR,
  FILE_UPLOAD_RESET
} from '../constants/ActionTypes'

const initialState = {
  error: null,
  inProgress: false,
  progress: 0,
  message: '',
  success: false
}

export function fileUpload(state = initialState, action) {
  let { type, payload } = action

  switch (type) {
    case FILE_UPLOAD_START: {
      return {...state, ...payload}
    }
    case FILE_UPLOAD_PROGRESS: {
      return {...state, ...payload}
    }
    case FILE_UPLOAD_SUCCESS: {
      return {...state, ...payload}
    }
    case FILE_UPLOAD_ERROR: {
      return {...state, ...payload}
    }
    case FILE_UPLOAD_RESET: {
      return {...state, ...payload}
    }
  }

  return state
}
