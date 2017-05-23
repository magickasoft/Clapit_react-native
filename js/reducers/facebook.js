import { ASSIGN_FACEBOOK_AUTH_DATA, ASSIGN_CLAPIT_ACCOUNT_DATA } from '../constants/ActionTypes'
import _ from 'lodash'

export function facebookAuthData(state={}, action) {
  let { type, payload } = action

  switch(type) {
    case ASSIGN_FACEBOOK_AUTH_DATA:
      return _.extend({}, payload)
    case ASSIGN_CLAPIT_ACCOUNT_DATA:
      if(_.isEmpty(state)) {
        // this is all we can gather from account data -- better than nothing
        let { facebookToken:tokenString, facebookId:userID } = payload

        if(tokenString && userID) {
          return { tokenString, userID }
        }
      }
  }

  return state
}
