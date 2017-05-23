import { doFetch } from './api'
import {
    FETCH_FRIENDS_DATA,
    FETCH_FRIENDS_DATA_SUCCESS,
    FETCH_FRIENDS_DATA_ERROR,
    SEARCH_FRIENDS,
    SEARCH_FRIENDS_SUCCESS,
    SEARCH_FRIENDS_ERROR,
    SEARCH_HASH_TAGS,
    SEARCH_HASH_TAGS_SUCCESS,
    SEARCH_HASH_TAGS_ERROR,
    DISMISS_FRIENDS_INVITE_MODAL
} from '../constants/ActionTypes'
import { updateClaps } from './claps'

export function fetchFriendsData(id, page, reload = false) {
    return dispatch => {

        dispatch(startFetchingFriends(reload))


        return doFetch(`Accounts/${id}/Following/publications`, {
            method: 'GET'
        }, { limit: 25, page: page }).then(data => {
            dispatch(fetchFriendsSuccess(data, page, reload))
        }).catch(err => {
            dispatch(fetchFriendsError(err))
        })

    }
}

export function fetchRecentData(id, page, reload = false) {
    return dispatch => {

        dispatch(startFetchingFriends(reload))

        return doFetch(`Accounts/publications`, {
            method: 'GET'
        }, { limit: 25, page: page }).then(data => {
            dispatch(fetchNewFeedSuccess(data, page, reload))
        }).catch(err => {
            dispatch(fetchFriendsError(err))
        })
    }
}

export function searchFriends(term, page, reload = false, top = 0) {

    return dispatch => {

        // trimming here causes duplicate results shown when adding and removing space
        //term = term.trim()

        if (!term.startsWith('#')) {

            // search friends
            dispatch(startSearchingFriends(page))

            // if empty search
            if (term === '') return dispatch(searchFriendsSuccess(term, [], page, reload))

            return doFetch(`accounts/byName/${term}`, {
                method: 'GET'
            }, { limit: 25, page: page }).then(data => {
                dispatch(searchFriendsSuccess(term, data, page, reload))
            }).catch(err => {
                dispatch(searchFriendsError(err))
            })

        } else {

            // search by hash tag
            dispatch(startSearchingByHashTags(page))

            // if empty search
            if (term === '#') return dispatch(searchByHashTagsSuccess(term, [], page, reload))

            // clean up term
            term = term.replace('#', '').toLowerCase()

            return doFetch(`posts/byHashTag/${term}`, {
                method: 'GET'
            }, { top, limit: 25, page: page }).then(data => {
                dispatch(searchByHashTagsSuccess(term, data, page, reload))
            }).catch(err => {
                dispatch(searchByHashTagsError(err))
            })
        }
    }
}

export function reloadFriendsData(id) {
    return fetchFriendsData(id, 0, true)
}

export function reloadRecentData(id) {
    return fetchRecentData(id, 0, true)
}

export function dismissFriendsInviteModal() {
    return {
        type: DISMISS_FRIENDS_INVITE_MODAL,
        payload: {
            inviteModalDismissed: true
        }
    }
}

function startFetchingFriends(reloading = false) {
    return {
        type: FETCH_FRIENDS_DATA,
        payload: {
            reloading
        }
    }
}

function fetchFriendsSuccess(data, page, reload) {
    return {
        type: FETCH_FRIENDS_DATA_SUCCESS,
        payload: {
            items: data,
            page,
            reload
        }
    }
}

function fetchNewFeedSuccess(data, page, reload) {
    return {
        type: FETCH_FRIENDS_DATA_SUCCESS,
        payload: {
            items: data,
            page,
            reload
        }
    }
}

function fetchFriendsError(error) {
    return {
        type: FETCH_FRIENDS_DATA_ERROR,
        payload: {
            error
        }
    }
}

function startSearchingFriends(page) {
    return {
        type: SEARCH_FRIENDS,
        payload: {
            page
        }
    }
}

function searchFriendsSuccess(searchTerm, data, page, reload) {
    return {
        type: SEARCH_FRIENDS_SUCCESS,
        payload: {
            searchTerm,
            results: data,
            page,
            reload
        }
    }
}

function searchFriendsError(error) {
    return {
        type: SEARCH_FRIENDS_ERROR,
        payload: {
            error
        }
    }
}

function startSearchingByHashTags(page) {
    return {
        type: SEARCH_HASH_TAGS,
        payload: {
            page
        }
    }
}

function searchByHashTagsSuccess(searchTerm, data, page, reload) {
    return {
        type: SEARCH_HASH_TAGS_SUCCESS,
        payload: {
            searchTerm,
            results: data,
            page,
            reload
        }
    }
}

function searchByHashTagsError(error) {
    return {
        type: SEARCH_HASH_TAGS_ERROR,
        payload: {
            error
        }
    }
}
