import { doFetch } from './api'

import {
    NETWORK_FOLLOWERS,
    NETWORK_FOLLOWING,
    NETWORK_CLAPS
} from '../constants/NetworkTypes'

import {
    FETCH_FOLLOWERS,
    FETCH_FOLLOWERS_SUCCESS,
    FETCH_FOLLOWERS_ERROR,
    FETCH_FOLLOWING,
    FETCH_FOLLOWING_SUCCESS,
    FETCH_FOLLOWING_ERROR,
    FETCH_CLAPS,
    FETCH_CLAPS_SUCCESS,
    FETCH_CLAPS_ERROR,
    FOLLOW_USER,
    UNFOLLOW_USER
} from '../constants/ActionTypes'

import { reloadFriendsData } from './friends'
import { reloadProfileData } from './profile'

export function fetchNetwork(id, type, page = 0, reload = false) {
    return dispatch => {

        let REQUEST = null
        let SUCCESS = null
        let FAILURE = null
        let uri = null
        let paginationParams ={ limit: 100, page }
        switch (type) {
            case NETWORK_FOLLOWERS:
                REQUEST = FETCH_FOLLOWERS
                SUCCESS = FETCH_FOLLOWERS_SUCCESS
                FAILURE = FETCH_FOLLOWERS_ERROR
                uri = `accounts/${id}/followers`
                break
            case NETWORK_FOLLOWING:
                REQUEST = FETCH_FOLLOWING
                SUCCESS = FETCH_FOLLOWING_SUCCESS
                FAILURE = FETCH_FOLLOWING_ERROR
                uri = `accounts/${id}/following`
                break;
            case NETWORK_CLAPS:
                REQUEST = FETCH_CLAPS
                SUCCESS = FETCH_CLAPS_SUCCESS
                FAILURE = FETCH_CLAPS_ERROR
                uri = `posts/${id}/claps/accounts`
                break;
        }

        dispatch(startFetchNetwork(REQUEST, id, page, reload))

        return doFetch(uri, {
            method: 'GET'
        }, paginationParams).then(data => {
            dispatch(fetchNetworkSuccess(SUCCESS, id, data))
        }).catch(err => {
            dispatch(fetchNetworkError(FAILURE, id, err))
        })
    }
}

export function follow(followUserId, currentUserId) {
    return dispatch => {
        dispatch({ type: FOLLOW_USER, payload: { accountId: followUserId } })
        return doFetch(`accounts/${followUserId}/follow`, {
            method: 'POST'
        }).then(() => {
            //reloadFriendsData(currentUserId)(dispatch)
        }).catch(err => {
            console.log('Following user error', err)
        })
    }
}

export function unfollow(unfollowUserId, currentUserId) {
    return dispatch => {
        dispatch({ type: UNFOLLOW_USER, payload: { accountId: unfollowUserId } })
        return doFetch(`accounts/${unfollowUserId}/unfollow`, {
            method: 'POST'
        }).then(() => {
            //reloadFriendsData(currentUserId)(dispatch)
            reloadProfileData(currentUserId)(dispatch)
        }).catch(err => {
            console.log('Unfollowing user error', err)
        })
    }
}

export function reloadNetwork(id, type) {
    return fetchNetwork(id, type, 0, true)
}

function startFetchNetwork(type, id, page = 0, reloading = false) {
    return {
        type: type,
        payload: {
            reloading,
            page,
            accountId: id
        }
    }
}

function fetchNetworkSuccess(type, id, data) {
    return {
        type: type,
        payload: {
            items: data,
            accountId: id
        }
    }
}

function fetchNetworkError(type, id, error) {
    return {
        type: type,
        payload: {
            error,
            accountId: id
        }
    }
}
