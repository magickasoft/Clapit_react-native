import {
    CLAP_POST
} from '../constants/ActionTypes'
import { doFetch } from './api'

export function clapPost(postId, isClapped) {
    return (dispatch) => {
        if (isClapped) {
            return
        }
        dispatch({ type: CLAP_POST, payload: { postId } })
        return doFetch(`Posts/${postId}/clap`, {
            method: 'POST'
        })
    }
}

export function sharePost(postId, facebook = false, twitter = false) {
    return () => {
        return doFetch(`Posts/${postId}/share`, {
            method: 'POST',
            body: {
                fbShare: facebook,
                twShare: twitter
            }
        })
    }
}
