import {
  ASSIGN_FACEBOOK_AUTH_DATA,
  FACEBOOK_LOGOUT,
  FACEBOOK_LOGOUT_SUCCESS,
  FACEBOOK_LOGOUT_ERROR,
  FACEBOOK_LOGIN_START,
  FACEBOOK_LOGIN_CANCEL
} from '../constants/ActionTypes'

import { doFetch } from './api'

import { FBSDKLoginManager } from 'react-native-fbsdklogin'
import { FBSDKAccessToken } from 'react-native-fbsdkcore'
import { clapitLoginOrConnect } from './clapit'
import _ from 'lodash'

const readPermissions = ["public_profile", "email", "user_friends", "user_posts"]
const publishPermissions = ["publish_actions"]

export function fbLogin() {
  return (dispatch, getState) => {
    FBSDKLoginManager.setLoginBehavior('native')

    dispatch(facebookLoginStart())

    FBSDKLoginManager.logInWithReadPermissions(readPermissions, (err, result) => {
      if(err) { // TODO: handle errors
        return;
      }

      let { isCancelled } = result
      if(isCancelled) {
        dispatch(facebookLoginCancel())
        return;
      }

      FBSDKAccessToken.getCurrentAccessToken(token => {
        if(!token) { return; }
        dispatch(assignFacebookAuthData(token))

        dispatch(clapitLoginOrConnect('facebook', token.tokenString));

        let { permissions } = token

        if(_.indexOf(permissions, 'publish_actions') < 0) { // needs publish permissions
          setTimeout(() => {  // give time for prev window to go away
            FBSDKLoginManager.logInWithPublishPermissions(publishPermissions, (err, result) => {

              // dispatch access token one more time
              FBSDKAccessToken.getCurrentAccessToken(token => {
                if(!token) { return; }
                dispatch(assignFacebookAuthData(token))
              })

            })
          },250)
        }
      })
    })
  }
}

export function fbLogout() {
  return dispatch => {

    dispatch(startFacebookLogout())

    return doFetch('Accounts/disconnect/facebook', {
      method: 'POST'
    }).then(data => {
      dispatch(facebookLogoutSuccess(data))
    }).catch(err => {
      dispatch(facebookLogoutError(err))
    })
  }
}

function startFacebookLogout() {
  return {
    type: FACEBOOK_LOGOUT
  }
}

function facebookLogoutSuccess(accountData) {
  return {
    type: FACEBOOK_LOGOUT_SUCCESS,
    payload: {
      accountData
    }
  }
}

function facebookLogoutError(error) {
  return {
    type: FACEBOOK_LOGOUT_ERROR,
    payload: {
      error
    }
  }
}

function assignFacebookAuthData(token) {
  return {
    type: ASSIGN_FACEBOOK_AUTH_DATA,
    payload: token
  }
}

function facebookLoginStart() {
  return {
    type: FACEBOOK_LOGIN_START
  }
}

function facebookLoginCancel() {
  return {
    type: FACEBOOK_LOGIN_CANCEL
  }
}
