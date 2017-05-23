import { PREFERENCES_SET } from '../constants/ActionTypes'


const initialState = {
  singitPopupShouldAutoShow: true,
  danceitPopupShouldAutoShow: true,
  makemeamusePopupShouldAutoShow: true
}

export function preferences(state = initialState, action) {
  let { type, payload } = action

  switch(type) {
    case PREFERENCES_SET:
      return {...state, ...payload}
  }

  return state
}