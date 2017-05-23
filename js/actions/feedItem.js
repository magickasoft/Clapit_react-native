import { doFetch } from './api'
import {
    FEED_ITEM_SHOW_DETAIL,
    FEED_ITEM_SHOW_PROFILE,
    FETCH_FEED_ITEM_REACTIONS,
    FETCH_FEED_ITEM_REACTIONS_SUCCESS,
    FETCH_FEED_ITEM_REACTIONS_ERROR,
    CREATE_FEED_ITEM_REACTIONS,
    CREATE_FEED_ITEM_REACTIONS_SUCCESS,
    CREATE_FEED_ITEM_REACTIONS_ERROR,
    UPDATE_FEED_ITEM_REACTIONS,
    UPDATE_FEED_ITEM_REACTIONS_SUCCESS,
    UPDATE_FEED_ITEM_REACTIONS_ERROR
} from '../constants/ActionTypes'

import { reloadUserPosts } from './app'

export function showItemDetail(itemId) {
    return dispatch => {

        dispatch({
            type: FEED_ITEM_SHOW_DETAIL,
            payload: {itemId}
        })
    }
}

export function showProfile(userId) {
    return dispatch => {

        dispatch({
            type: FEED_ITEM_SHOW_PROFILE,
            payload: {userId}
        })
    }
}

export function createItemReaction(itemId, accountId, mediaId, comment) {

  return dispatch => {

    dispatch({
        type: CREATE_FEED_ITEM_REACTIONS,
        payload: {
            id: itemId
        }
    })

    let reaction = {
      accountId: accountId,
      mediaId: mediaId,
      postId: itemId,
      comment: comment
    }

    doFetch(`posts/${itemId}/comments`, {
        method: 'POST',
        body: reaction
    }).then(reaction => {
        dispatch({
            type: CREATE_FEED_ITEM_REACTIONS_SUCCESS,
            payload: {
                id: itemId,
                reaction: reaction
            }
        })
    }).catch(error => {
        dispatch({
            type: CREATE_FEED_ITEM_REACTIONS_ERROR,
            payload: {
                error
            }
        })
    })
  }
}

export function updateItemReaction(itemId, reactionId, comment) {

    return dispatch => {

        dispatch({
            type: UPDATE_FEED_ITEM_REACTIONS,
            payload: {
                id: itemId
            }
        })

        doFetch(`Comments/${reactionId}`, {
            method: 'PUT',
            body: { comment }
        }).then(reaction => {
            console.log('reaction', reaction)
            dispatch({
                type: UPDATE_FEED_ITEM_REACTIONS_SUCCESS,
                payload: {
                    id: itemId,
                    reaction: reaction
                }
            })
        }).catch(error => {
            dispatch({
                type: UPDATE_FEED_ITEM_REACTIONS_ERROR,
                payload: {
                    error
                }
            })
        })
    }
}

export function fetchItemReactions(itemId) {
    return dispatch => {

        dispatch({
            type: FETCH_FEED_ITEM_REACTIONS,
            payload: {
                id: itemId
            }
        })

        doFetch(`posts/${itemId}/comments`, {
            method: 'GET'
        }).then(comments => {
            dispatch({
                type: FETCH_FEED_ITEM_REACTIONS_SUCCESS,
                payload: {
                    id: itemId,
                    reactions: comments
                }
            })
        }).catch(error => {
            dispatch({
                type: FETCH_FEED_ITEM_REACTIONS_ERROR,
                payload: {
                    error
                }
            })
        })
    }
}

export function deleteItem(item) {
    return (dispatch) => {
        const itemId = item.id
        const userId = item.Account.id
        let timeout = setTimeout(() => {
            reloadUserPosts(userId)(dispatch)
        }, 1500);
        doFetch(`posts/${itemId}/delete`, {
            method: 'POST'
        }).then(() => {
            clearTimeout(timeout)
            reloadUserPosts(userId)(dispatch)
        }).catch(error => {
            clearTimeout(timeout)
            console.log(`Error while deleting user post: ${itemId}`, error)
        })
    }
}


export function reportInappropriateItem(item) {

    return () => {
        const itemId = item.id
        doFetch(`posts/${itemId}/flag`, {
            method: 'POST'
        }).catch(error => {
            console.log(`Error while deleting user post: ${itemId}`, error)
        })
    }
}


export function deleteReaction(reaction, byPostOwner) {
    // console.log('remove reaction', reaction, byPostOwner)
    let timeout = setTimeout(() => {
            reloadUserPosts(userId)(dispatch)
        }, 1500);
    return dispatch => {
        const {id: reactionId, postId, Account: {id: userId}} = reaction
        const deleteCall = byPostOwner
          ? doFetch(`posts/${postId}/Comments/${reactionId}`, {
            method: 'DELETE'
            })
          : doFetch(`comments/${reactionId}`, {
              method: 'DELETE'
            });

        deleteCall.then(() => {
            fetchItemReactions(postId)(dispatch)
        }).then(() => {
            clearTimeout(timeout)
            reloadUserPosts(userId)(dispatch)
        }).catch(error => {
            console.log(`Error while deleting post reaction: ${reactionId}`, error)
        })
    }
}

