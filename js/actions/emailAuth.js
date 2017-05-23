import {
  EMAIL_LOGOUT,
  EMAIL_LOGOUT_SUCCESS,
  EMAIL_LOGOUT_ERROR,
  EMAIL_LOGIN_START,
  EMAIL_SIGNUP_START,
  EMAIL_AUTH_DATA,
  EMAIL_LOGIN_ERROR,
  CLEAR_AUTH_ERROR
} from '../constants/ActionTypes'

import { doFetch } from './api'
import { clapitLoginOrConnect } from './clapit'

export function emailLogin(email, password, callback, isNew) {
  return (dispatch) => {
    dispatch(startEmailLogin());
    return doFetch('Accounts/login?include=user', {
      method: 'POST',
      body: {
          email, password
      }
    }).then(data => {
      data.isNew = isNew;
      dispatch(emailAuthData(data))
      dispatch(clapitLoginOrConnect('email', data));
      callback && callback()
    }).catch(err => {
      callback && callback(err)
      dispatch(emailLoginError(err))
    })
  }
}
export function emailSignup(email, password, callback) {
  return (dispatch) => {
    dispatch(startEmailSignup());
    return doFetch('Accounts/', {
      method: 'POST',
      body: {
          email, password
      }
    }).then(data => {
      callback && callback()
    }).catch(err => {
      callback && callback(err)
      dispatch(emailLoginError(err))
    })
  }
}

export function emailLogout() {
  return dispatch => {

    dispatch(startEmailLogout())

    return doFetch('Accounts/logout', {
      method: 'POST'
    }).then(data => {
      dispatch(emailLogoutSuccess(data))
    }).catch(err => {
      dispatch(emailLogoutError(err))
    })
  }
}

function startEmailLogout() {
  return {
    type: EMAIL_LOGOUT
  }
}

function startEmailLogin() {
  return {
    type: EMAIL_LOGIN_START
  }
}

function startEmailSignup() {
  return {
    type: EMAIL_SIGNUP_START
  }
}

function emailLogoutSuccess(accountData) {
  return {
    type: EMAIL_LOGOUT_SUCCESS,
    payload: {
      accountData
    }
  }
}

function emailLogoutError(error) {
  return {
    type: EMAIL_LOGOUT_ERROR,
    payload: {
      error
    }
  }
}

function emailAuthData(accountData) {
  return {
    type: EMAIL_AUTH_DATA,
    payload: {
      accountData
    }
  }
}

function emailLoginError(error) {
  return {
    type: EMAIL_LOGIN_ERROR,
    payload: {
      error: error
    }
  }
}

export function clearAuthError() {
  return {
    type: CLEAR_AUTH_ERROR
  }
}