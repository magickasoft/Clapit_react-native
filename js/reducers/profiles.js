import {
    FETCH_PROFILE_DATA,
    FETCH_PROFILE_DATA_SUCCESS,
    FETCH_PROFILE_DATA_ERROR,
    FETCH_RECENT_POSTS,
    FETCH_RECENT_POSTS_SUCCESS,
    FETCH_RECENT_POSTS_ERROR,
    FETCH_POPULAR_POSTS,
    FETCH_POPULAR_POSTS_SUCCESS,
    FETCH_POPULAR_POSTS_ERROR
} from '../constants/ActionTypes'

import {
    PROFILE_POSTS_RECENT,
    PROFILE_POSTS_POPULAR
} from '../constants/PostsTypes'

export function profiles(state = {}, action) {
    let { type, payload } = action

    switch (type) {
        case FETCH_PROFILE_DATA:
        {
            let { accountId, details } = payload
            details.isLoading = true;

            return Object.assign({}, state, { [accountId]: details })
        }
        case FETCH_PROFILE_DATA_SUCCESS:
        {
            let { accountId, details } = payload
            details.isLoading = false;
            return Object.assign({}, state, { [accountId]: details })
        }
        case FETCH_PROFILE_DATA_ERROR:
        {
            let { accountId, error } = payload
            details.isLoading = false;
            return Object.assign({}, state, { [accountId]: { error } })
        }
    }

    return state
}

export function recentPosts(state = {}, action) {
    let { type, payload } = action

    switch (type) {
        case FETCH_RECENT_POSTS_SUCCESS:
        {
            let { accountId, items:newItems, page } = payload
            let items = []

            if (state[accountId]) {
                ({ items } = state[accountId])
            }

            if (page == 0) {
                items = newItems
            } else {
                items = items.concat(newItems)
            }

            return Object.assign({}, state, { [accountId]: { page, items } })
        }
        case FETCH_RECENT_POSTS_ERROR:
        {
            let { accountId, error } = payload

            return Object.assign({}, state, { [accountId]: { error } })
        }
    }

    return state
}

export function popularPosts(state = {}, action) {
    let { type, payload } = action

    switch (type) {
        case FETCH_POPULAR_POSTS_SUCCESS:
        {
            let { accountId, items:newItems, page } = payload
            let items = []

            if (state[accountId]) {
                ({ items } = state[accountId])
            }

            if (page == 0) {
                items = newItems
            } else {
                items = items.concat(newItems)
            }

            return Object.assign({}, state, { [accountId]: { page, items } })
        }
        case FETCH_POPULAR_POSTS_ERROR:
        {
            let { accountId, error } = payload

            return Object.assign({}, state, { [accountId]: { error } })
        }
    }

    return state
}
