import { doFetch } from './api'
import {
    FETCH_NOTIFICATIONS_DATA,
    FETCH_NOTIFICATIONS_SUCCESS,
    FETCH_NOTIFICATIONS_ERROR,
    MARK_NOTIFICATION_OLD
} from '../constants/ActionTypes'
const Platform = require('Platform');

export function fetchNotifications(id, page, reload = false) {
    return dispatch => {

        dispatch(startFetchingNotifications(reload))

        return doFetch(`Accounts/${id}/Activities`, {
            method: 'GET'
        }, { limit: 50, page: page }).then(data => {
            dispatch(fetchNotificationsSuccess(data))
        }).catch(err => {
            dispatch(fetchNotificationsError(err))
        })
    }
}

export function reloadNotificationsData(id) {
    return fetchNotifications(id, 0, true)
}

export function markNotificationOld(notificationId) {
    return {
        type: MARK_NOTIFICATION_OLD,
        payload: notificationId
    }
}

function startFetchingNotifications(reloading = false) {
    return {
        type: FETCH_NOTIFICATIONS_DATA,
        payload: {
            reloading
        }
    }
}

function fetchNotificationsSuccess(data) {
    return {
        type: FETCH_NOTIFICATIONS_SUCCESS,
        payload: {
            items: data
        }
    }
}

function fetchNotificationsError(error) {
    return {
        type: FETCH_NOTIFICATIONS_ERROR,
        payload: {
            error
        }
    }
}

export function storeDeviceToken(deviceToken) {
    return dispatch => {
        console.log('Got device token', deviceToken)
        const pushType = Platform.OS === 'android' ? 'gcm' : undefined
        return doFetch('account/deviceToken', {
            method: 'POST',
            body: { deviceToken, pushType, deviceTokenLastModified: Date.now() }
        }).then(data => {
            dispatch(storeDeviceTokenSuccess())
        }).catch(err => {
            dispatch(storeDeviceTokenError(err))
        });
    }
}

function storeDeviceTokenSuccess() {
    return {
        type: 'REGISTERED_PUSH_NOTIFICATIONS_SUCCESS',
    };
}

function storeDeviceTokenError(err) {
    console.log('Got device token err', err);
    return {
        type: 'REGISTERED_PUSH_NOTIFICATIONS_ERROR',
    };
}