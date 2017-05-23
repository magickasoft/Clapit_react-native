import {
    CLAP_POST,
    FETCH_FEED_DATA_SUCCESS,
    FETCH_FRIENDS_DATA_SUCCESS,
    FETCH_RECENT_POSTS_SUCCESS,
    FETCH_POPULAR_POSTS_SUCCESS,
    SEARCH_HASH_TAGS_SUCCESS
} from '../constants/ActionTypes'

const initialState = {
    claps: {},
    myClaps: []
}

export function claps(state = initialState, action) {
    let { type, payload } = action

    switch (type) {
        case CLAP_POST:
        {
            const postId = payload.postId
            const claps = Object.assign({}, state.claps)
            const myClaps = state.myClaps.slice()
            const myClap = myClaps.indexOf(postId)
            if (myClap >= 0) {
                myClaps.splice(myClap, 1)
                claps[postId] = claps[postId] - 1
            } else {
                myClaps.push(postId)
                claps[postId] = (claps[postId] || 0) + 1
            }
            return { ...state, claps, myClaps }
        }

        case FETCH_RECENT_POSTS_SUCCESS:
        case FETCH_POPULAR_POSTS_SUCCESS:
        case FETCH_FEED_DATA_SUCCESS:
        case FETCH_FRIENDS_DATA_SUCCESS:
        {
            const { items } = payload

            const claps = Object.assign({}, state.claps)
            const myClaps = state.myClaps.slice()

            items.forEach(item => {
                let post = item.post ? item.post : item

                claps[post.id] = post.clapCount
                const myClap = myClaps.indexOf(post.id)
                if (myClap >= 0 && !post.clapped) {
                    myClaps.splice(myClap, 1)
                }
                if (myClap < 0 && post.clapped) {
                    myClaps.push(post.id)
                }
            })
            return { ...state, claps, myClaps }
        }

        case SEARCH_HASH_TAGS_SUCCESS:
        {
            const { results } = payload

            const claps = Object.assign({}, state.claps)
            const myClaps = state.myClaps.slice()

            // iterate results and re-calculate the myClaps array
            results.forEach(post => {
                // store into a map post.id to post clapCount
                claps[post.id] = post.clapCount
                // check if current user has clapped the post
                const myClap = myClaps.indexOf(post.id)
                if (myClap >= 0 && !post.clapped) {
                    myClaps.splice(myClap, 1)
                }
                if (myClap < 0 && post.clapped) {
                    myClaps.push(post.id)
                }
            })
            return { ...state, claps, myClaps }
        }

    }

    return state
}
