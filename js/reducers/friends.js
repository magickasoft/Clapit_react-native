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

const initialState = {
    fetchingRemoteData: false,
    reloading: false,
    error: undefined,
    items: [],
    results: [],
    itemsById: {},
    inviteModalDismissed: false
}

function createItemId(item) {
    if (item.reaction) {
        return 'reaction-' + item.reaction.id
    } else {
        return 'post-' + item.post.id
    }
}

export function friends(state = initialState, action) {
    let { type, payload } = action

    switch (type) {
        case FETCH_FRIENDS_DATA:
        {
            return { ...state, fetchingRemoteData: true, reloading: payload.reloading }
        }
        case FETCH_FRIENDS_DATA_SUCCESS:
        {
            const { reload } = payload
            if (!reload && payload.page <= state.page) {
                return state
            }

            const newItemsById = reload ? {} : Object.assign({}, state.itemsById)
            const existingItems = reload ? [] : state.items

            // ignoring publications without post
            const postsItems = payload.items.filter(item => item.post)
            postsItems.forEach(item => newItemsById[createItemId(item)] = item)
            const newItems = existingItems.concat(postsItems.map(item => createItemId(item)))
            return {
                ...state,
                fetchingRemoteData: false,
                page: payload.page,
                items: newItems,
                itemsById: newItemsById,
                dataType: 'friends-data'
            }
        }
        case FETCH_FRIENDS_DATA_ERROR:
        {
            return { ...state, fetchingRemoteData: false, error: payload.error }
        }
        case SEARCH_FRIENDS:
        {
            return { ...state, fetchingRemoteData: true, page: payload.page }
        }
        case SEARCH_FRIENDS_SUCCESS:
        {
            // set following flag?
            let newFriends = payload.results.map(item => {
                item.following = (item.friendship == 1)
                return item
            })

            // pagination - collect previous results, otherwise new results would override existing results
            const friends = (payload.searchTerm === state.searchTerm && payload.page > 0) ?
                state.results.concat(newFriends)
                : newFriends;

            return {
                ...state,
                fetchingRemoteData: false,
                searchTerm: payload.searchTerm,
                page: payload.page,
                results: friends,
                dataType: 'friends-search'
            }
        }
        case SEARCH_FRIENDS_ERROR:
        {
            return { ...state, fetchingRemoteData: false, error: payload.error }
        }

        /// BELOW SHOULD REALLY BE UNDER HASH TAGS BUT CURRENTLY UNDER FRIENDS VIEW SO KEEPING HERE ///

        case SEARCH_HASH_TAGS:
        {
            return { ...state, fetchingRemoteData: true, page: payload.page }
        }
        case SEARCH_HASH_TAGS_SUCCESS:
        {
            const { page, reload, searchTerm, results } = payload
            // if (!reload && page <= state.page) {
            //     return state
            // }

            // pagination - collect previous results, otherwise new results would override existing results
            const posts = (searchTerm === state.searchTerm) ?
                state.results.concat(results)
                : results;

            return {
                ...state,
                fetchingRemoteData: false,
                searchTerm: searchTerm,
                page: page,
                results: posts,
                dataType: 'hash-tags-search'
            }
        }
        case SEARCH_HASH_TAGS_ERROR:
        {
            return { ...state, fetchingRemoteData: false, error: payload.error }
        }
        case DISMISS_FRIENDS_INVITE_MODAL:
        {
            return { ...state, inviteModalDismissed: payload.inviteModalDismissed }
        }
    }

    return state
}
