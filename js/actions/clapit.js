import { doFetch, assignAccessToken } from './api'
import {
  ASSIGN_DEVICE_TOKEN,
  ASSIGN_CLAPIT_ACCOUNT_DATA,
  LOGOUT,
  LOGGING_IN,
  API_ERROR,
  CLEAR_API_ERROR,
  CLAP_POST
} from '../constants/ActionTypes'
import _ from 'lodash'

import { NativeModules } from 'react-native'
const { RNMixpanel:Mixpanel } = NativeModules

export function clapitLoginOrConnect(socialNetwork, authData) {
    return (dispatch, getState) => {
        let loginCallback, connectCallback
        switch (socialNetwork) {
            case 'facebook':
                loginCallback = loginWithFacebook
                connectCallback = connectWithFacebook
                break
            case 'twitter':
                loginCallback = loginWithTwitter
                connectCallback = connectWithTwitter
                break
            case 'instagram':
                loginCallback = loginWithInstagram
                connectCallback = connectWithInstagram
                break
            case 'email':
                loginCallback = loginWithEmail
                connectCallback = connectWithEmail
                break
        }

        let { clapitAccountData } = getState()

        if (_.isEmpty(clapitAccountData) || !clapitAccountData.accessToken) {  // login
            dispatch(startLogin())
            return dispatch(loginCallback(authData))
        } else { // connect
            return dispatch(connectCallback(authData))
        }
    }
}

export function verifyDeviceToken() {
    return (dispatch, getState) => {
        const {
          clapitAccountData: { username, id, deviceToken: apiDeviceToken },
          clapitDeviceToken: { deviceToken }
        } = getState()

        // console.log('start update token', username, id, deviceToken);

        if (username && id && deviceToken && deviceToken !== apiDeviceToken) {
            // console.log('updated token', username, id, deviceToken);
            return clapitSaveProfile()(dispatch, getState);
        }

        return {
            type: 'DEVICE_TOKEN_UPDATE_NOT_READY'
        }
    }
}

export function clapitSaveProfile(username=null, description=null, mediaId = null,
                                  fullName = null, school = null, website = null,
                                  coverMediaId = null, deviceToken = null, callback) {
    return (dispatch, getState) => {
        let { clapitAccountData, clapitDeviceToken } = getState()
        let { id:userId } = clapitAccountData

        if (!mediaId) {
            ({ mediaId } = clapitAccountData)
        }

        if (!coverMediaId) {
            ({ coverMediaId } = clapitAccountData)
        }
        if (!deviceToken) {
            deviceToken = clapitDeviceToken.deviceToken || clapitAccountData.deviceToken;
        }
        if (!username) {
            username = clapitAccountData.username;
        }
        if (fullName === undefined || fullName === null) {
            fullName = clapitAccountData.fullName;
        }
        if (description === undefined || description === null) {
            description = clapitAccountData.description;
        }
        if (school === undefined || school === null) {
            school = clapitAccountData.school;
        }
        if (website === undefined || website === null) {
            website = clapitAccountData.website;
        }
        //update first before the api returns
        const newData = _.assign({}, clapitAccountData)
        newData.deviceToken = deviceToken
        dispatch(assignClapitAccountData(newData))

        return doFetch(`Accounts/${userId}`, {
            method: 'PATCH',
            body: {
                username,
                description,
                mediaId,
                fullName,
                school,
                website,
                coverMediaId,
                deviceToken
            }
        }).then(data => {
            if (data.error) {
                handleError(dispatch, data.error)
                if (callback) callback(data.error)
                return;
            }
            dispatch(assignClapitAccountData(data))
            if (callback) callback(null, data)

        }).catch(err => {
            if (callback) callback(err)
            handleError(dispatch, err)
        })

    }
}

export function clapitLogout() {
    return dispatch => {

        return dispatch(logout())
        
        // return doFetch('Accounts/logout', {
        //     method: 'POST'
        // }).then(() => {
        //     return dispatch(logout())
        // }).catch(
        //     handleError.bind(null, dispatch)
        // )
    }
}

export function clearApiError() {
    return {
        type: CLEAR_API_ERROR
    }
}

function handleError(dispatch, error) {
    dispatch(showAPIError(error))
}

function startLogin() {
    return {
        type: LOGGING_IN
    }
}

function logout() {
    return {
        type: LOGOUT
    }
}

function showAPIError(error) {
    return {
        type: API_ERROR,
        payload: error
    }
}

function loginWithFacebook(accessToken) {
    return dispatch => {
        return doFetch('Accounts/login/facebook', {
            method: 'POST',
            body: {
                access_token: accessToken
            }
        }).then(data => {
            if (data.error) {
                handleError(dispatch, data.error);
                return;
            }

            dispatch(assignClapitAccountData(data))


            Mixpanel.identify(data.email)
            return data
        }).catch(handleError.bind(null, dispatch))
    }
}

function loginWithEmail(data) {
    return dispatch => {
        let Account = data.user
        Account.accessToken = data.id;
        Account.accessTokenTTL = data.ttl;
        Account.accessTokenCreated = data.created;
        Account.isNew = data.isNew;
        dispatch(assignClapitAccountData(Account))
        Mixpanel.identify(data.email)
        return data
    }
}

function connectWithEmail(data) {
    return dispatch => {
        let Account = data.user
        Account.accessToken = data.id
        Account.accessTokenTTL = data.ttl
        Account.accessTokenCreated = data.created
        Account.isNew = data.isNew;
        dispatch(assignClapitAccountData(Account))
        return data
    }
}

function connectWithFacebook(accessToken) {
    return dispatch => {
        return doFetch('Accounts/connect/facebook', {
            method: 'POST',
            body: {
                fbAccessToken: accessToken
            }
        }).then(data => {
            if (data.error) {
                handleError(dispatch, data.error);
                return;
            }

            //dispatch(assignClapitAccountData(data))
            return data
        }).catch(handleError.bind(null, dispatch))
    }
}

function loginWithTwitter(twitterAuthData) {
    let { authToken, authTokenSecret, email } = twitterAuthData

    return dispatch => {
        let body = {
            oauth_token: authToken,
            oauth_token_secret: authTokenSecret
        }

        if (email) {
            body = _.assign({}, body, { email })
        }

        return doFetch('Accounts/login/twitter', {
            method: 'POST',
            body
        }).then(data => {
            if (data.error) {
                handleError(dispatch, data.error);
                return;
            }
            dispatch(assignClapitAccountData(data))
            Mixpanel.identify(data.email)
        }).catch(handleError.bind(null, dispatch))
    }
}

function connectWithTwitter(twitterAuthData) {
    let { authToken, authTokenSecret, email } = twitterAuthData

    return dispatch => {
        let body = {
            oauthToken: authToken,
            oauthSecret: authTokenSecret
        }

        if (email) {
            body = _.assign({}, body, { email })
        }

        return doFetch('Accounts/connect/twitter', {
            method: 'POST',
            body
        }).then(data => {
            if (data.error) {
                handleError(dispatch, data.error);
                return;
            }
            //dispatch(assignClapitAccountData(data))
        }).catch(handleError.bind(null, dispatch))
    }
}

function loginWithInstagram(instagramAuthData) {
    let { accessToken } = instagramAuthData

    return dispatch => {
        return doFetch('Accounts/login/instagram', {
            method: 'POST',
            body: {
                access_token: accessToken
            }
        }).then(data => {
            if (data.error) {
                handleError(dispatch, data.error);
                return;
            }

            dispatch(assignClapitAccountData(data))
        }).catch(handleError.bind(null, dispatch))
    }
}

function connectWithInstagram(instagramAuthData) {
    let { accessToken } = instagramAuthData

    return dispatch => {
        return doFetch('Accounts/connect/instagram', {
            method: 'POST',
            body: {
                accessToken
            }
        }).then(data => {
            if (data.error) {
                handleError(dispatch, data.error);
                return;
            }

//      dispatch(assignClapitAccountData(data))
        }).catch(handleError.bind(null, dispatch))
    }
}

function assignClapitAccountData(data) {
    let { accessToken } = data
    assignAccessToken(accessToken)

    return {
        type: ASSIGN_CLAPIT_ACCOUNT_DATA,
        payload: data
    }
}

export function assignDeviceToken(deviceToken) {

    return {
        type: ASSIGN_DEVICE_TOKEN,
        payload: { deviceToken }
    }
}