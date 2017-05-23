import { ASSIGN_TWITTER_AUTH_DATA, ASSIGN_CLAPIT_ACCOUNT_DATA } from '../constants/ActionTypes'
import _ from 'lodash'

export function twitterAuthData(state={}, action) {
  let { type, payload } = action

  switch(type) {
    case ASSIGN_TWITTER_AUTH_DATA:
      return _.extend({}, payload)
    case ASSIGN_CLAPIT_ACCOUNT_DATA: // get twitter data from incoming login, if it's empty
      if(_.isEmpty(state)) {
        let {
          twitterToken:authToken,
          twitterTokenSecret:authTokenSecret,
          twitterId:userID
        } = payload  // note excluding email as it may be a FB login email, different from Twitter email

        if(authToken && authTokenSecret && userID) {
          return { authToken, authTokenSecret, userID }
        }
      }
  }

  return state
}
