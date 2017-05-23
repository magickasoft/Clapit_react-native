import {
    FETCH_FEED_ITEM_REACTIONS,
    FETCH_FEED_ITEM_REACTIONS_SUCCESS,
    FETCH_FEED_ITEM_REACTIONS_ERROR,
    CREATE_FEED_ITEM_REACTIONS,
    CREATE_FEED_ITEM_REACTIONS_SUCCESS,
    UPDATE_FEED_ITEM_REACTIONS,
    UPDATE_FEED_ITEM_REACTIONS_SUCCESS
} from '../constants/ActionTypes'

const initialState = {
    reactionsByPostId: {},
    reactionCreated: false,
    fetchingData: false,
    fetchingDataPostId: undefined,
    reactionOfPostId: undefined
}

export function reactions(state = initialState, action) {
    let { type, payload } = action

    switch (type) {
        case FETCH_FEED_ITEM_REACTIONS: {
            return {...state, fetchingData: true, reactionCreated: false, fetchingDataPostId: payload.id}
        }
        case FETCH_FEED_ITEM_REACTIONS_SUCCESS: {
            let newReactionsById = Object.assign({}, state.reactionsByPostId)
            newReactionsById[payload.id] = payload.reactions
            return {...state, fetchingData: false, reactionCreated: false, reactionsByPostId: newReactionsById}
        }
        case UPDATE_FEED_ITEM_REACTIONS:
        case CREATE_FEED_ITEM_REACTIONS: {
            return {...state, fetchingData: true, reactionCreated: false, fetchingDataPostId: payload.id}
        }

        case UPDATE_FEED_ITEM_REACTIONS_SUCCESS:
        case CREATE_FEED_ITEM_REACTIONS_SUCCESS: {
            return {...state, fetchingData: false, reactionCreated: true, reactionOfPostId: payload.reaction}
        }
    }

    return state
}
