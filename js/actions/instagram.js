import {
  ASSIGN_INSTAGRAM_AUTH_DATA,
  INSTAGRAM_LOGOUT,
  INSTAGRAM_LOGOUT_ERROR,
  INSTAGRAM_LOGOUT_SUCCESS
} from '../constants/ActionTypes'

import { doFetch } from './api'

import { Linking } from 'react-native'
import { clapitLoginOrConnect } from './clapit'
import _ from 'lodash'

const clientId = '14d8aaec0c5d408f886b39feb872458c'
const redirectUri = 'clapitInstagram://api.instagram'

let handleOpenUrlCallback

function handleOpenUrl(dispatch, event) {
  let { url } = event

  if(_.startsWith(_.toLower(url), 'clapitinstagram')) { // instagram login
    let [, queryString] = _.split(url, '#')
    let [, accessToken] = _.split(queryString, '=')
    let [userID] = _.split(accessToken, '.')

    Linking.removeEventListener('url', handleOpenUrlCallback)

    dispatch(assignInstagramAuthData({userID, accessToken}))

    dispatch(clapitLoginOrConnect('instagram', {accessToken}))
  }
}

export function instagramLogin() {
  return dispatch => {
    if(handleOpenUrlCallback) {
      Linking.removeEventListener('url', handleOpenUrlCallback)
    }
    handleOpenUrlCallback = handleOpenUrl.bind(null, dispatch)

    Linking.addEventListener('url', handleOpenUrlCallback)

    Linking.openURL(`https://api.instagram.com/oauth/authorize/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=relationships`)
  }
}

export function instagramLogout() {
  return dispatch => {

    dispatch(startInstagramLogout())

    return doFetch('Accounts/disconnect/instagram', {
      method: 'POST'
    }).then(data => {
      dispatch(instagramLogoutSuccess(data))
    }).catch(err => {
      dispatch(instagramLogoutError(err))
    })
  }
}

function startInstagramLogout() {
  return {
    type: INSTAGRAM_LOGOUT
  }
}

function instagramLogoutSuccess(accountData) {
  return {
    type: INSTAGRAM_LOGOUT_SUCCESS,
    payload: {
      accountData
    }
  }
}

function instagramLogoutError(error) {
  return {
    type: INSTAGRAM_LOGOUT_ERROR,
    payload: {
      error
    }
  }
}

function assignInstagramAuthData(authData) {
  return {
    type: ASSIGN_INSTAGRAM_AUTH_DATA,
    payload: authData
  }
}
