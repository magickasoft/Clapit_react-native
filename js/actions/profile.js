import { doFetch } from './api'
import {
    FETCH_PROFILE_DATA,
    FETCH_PROFILE_DATA_SUCCESS,
    FETCH_RECENT_POSTS_SUCCESS,
    FETCH_RECENT_POSTS_ERROR,
    FETCH_POPULAR_POSTS_SUCCESS,
    FETCH_POPULAR_POSTS_ERROR
} from '../constants/ActionTypes'

export function fetchProfileData(id) {
    return dispatch => {
        dispatch(fetchProfileDataStart(id))
        return doFetch(`Accounts/${id}`, {
            method: 'GET'
        }).then(data => {
            dispatch(fetchDataSuccess(id, data))
        }).catch(err => {
            dispatch(fetchDataError(id, err))
        })
    }
}

export function fetchProfileRecentPosts(id, page = 0) {
    return dispatch => {
        return doFetch(`Accounts/${id}/Posts/published`, {
            method: 'GET'
        }, { limit: 20, page: page }).then(data => {
            dispatch(fetchRecentPostsSuccess(id, data, page))
        }).catch(err => {
            dispatch(fetchRecentPostsError(id, err, page))
        })
    }
}

export function fetchProfilePopularPosts(id, page = 0) {
    return dispatch => {
        return doFetch(`Accounts/${id}/Posts/top`, {
            method: 'GET'
        }, { limit: 20, page: page }).then(data => {
            dispatch(fetchPopularPostsSuccess(id, data, page))
        }).catch(err => {
            dispatch(fetchPopularPostsError(id, err, page))
        })
    }
}

export function reloadProfileData(id) {
    return fetchProfileData(id, true)
}

function fetchProfileDataStart(accountId) {
    return {
        type: FETCH_PROFILE_DATA,
        payload: {
            details: {},
            accountId
        }
    }
}

function fetchDataSuccess(accountId, data) {
    return {
        type: FETCH_PROFILE_DATA_SUCCESS,
        payload: {
            details: data,
            accountId
        }
    }
}

function fetchDataError(accountId, error) {
    return {
        type: FETCH_RECENT_POSTS_ERROR,
        payload: {
            error,
            accountId
        }
    }
}

function fetchRecentPostsSuccess(accountId, data, page) {
    return {
        type: FETCH_RECENT_POSTS_SUCCESS,
        payload: {
            items: data,
            accountId,
            page
        }
    }
}

function fetchRecentPostsError(accountId, error, page) {
    return {
        type: FETCH_RECENT_POSTS_ERROR,
        payload: {
            error,
            accountId,
            page
        }
    }
}

function fetchPopularPostsSuccess(accountId, data, page) {
    return {
        type: FETCH_POPULAR_POSTS_SUCCESS,
        payload: {
            items: data,
            accountId,
            page
        }
    }
}

function fetchPopularPostsError(accountId, error, page) {
    return {
        type: FETCH_POPULAR_POSTS_ERROR,
        payload: {
            error,
            accountId,
            page
        }
    }
}
