import {
    PREFERENCES_SET
} from '../constants/ActionTypes'

export function setPreferences(payload) {
    return dispatch => {
        dispatch(
          {
              type: PREFERENCES_SET,
              payload
          }
        )
    }
}
