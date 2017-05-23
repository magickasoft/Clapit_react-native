import {
  ASSIGN_TWITTER_AUTH_DATA,
  TWITTER_LOGOUT,
  TWITTER_LOGOUT_SUCCESS,
  TWITTER_LOGOUT_ERROR
} from '../constants/ActionTypes'

import { doFetch } from './api'

import { clapitLoginOrConnect } from './clapit'
import { NativeModules } from 'react-native'

let { TwitterManager } = NativeModules

const TWITTER_CONSUMER_KEY = '7BNH1Zdl9hbzQR6hyKytQvPU8'
const TWITTER_CONSUMER_SECRET = 'DWJdEokfqj2jZXNPNK1QsVdxJfbTFHao0hjwvVMyYCX1oDYma5'

export function twitterLogin() {
  return dispatch => {
    TwitterManager.startWithConsumerKeyAndSecret(TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET)

    TwitterManager.loginWithCompletion(response => {

      let { cancelled, session } = response
      console.log('session',session);
      if(!cancelled) {
        TwitterManager.requestEmail(response => {
          let { cancelled, email } = response
          console.log('email',email);
          let twitterAuthData = _.assign({}, session, {email})

          dispatch(assignTwitterAuthData(twitterAuthData))

          dispatch(clapitLoginOrConnect('twitter', twitterAuthData))
        })
      }
    })
  }
}

export function twitterLogout() {
  return dispatch => {
    TwitterManager.startWithConsumerKeyAndSecret(TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET)

    TwitterManager.logout()

    dispatch(startTwitterLogout())

    return doFetch('Accounts/disconnect/twitter', {
      method: 'POST'
    }).then(data => {
      dispatch(twitterLogoutSuccess(data))
    }).catch(err => {
      dispatch(twitterLogoutError(err))
    })
  }
}

function startTwitterLogout() {
  return {
    type: TWITTER_LOGOUT
  }
}

function twitterLogoutSuccess(accountData) {
  return {
    type: TWITTER_LOGOUT_SUCCESS,
    payload: {
      accountData
    }
  }
}

function twitterLogoutError(error) {
  return {
    type: TWITTER_LOGOUT_ERROR,
    payload: {
      error
    }
  }
}

function assignTwitterAuthData(authData) {
  return {
    type: ASSIGN_TWITTER_AUTH_DATA,
    payload: authData
  }
}
