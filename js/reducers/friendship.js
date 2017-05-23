import {
  INIT_FRIENDSHIPS,
  FETCH_FOLLOWING,
  FETCH_FOLLOWING_SUCCESS,
  FETCH_FOLLOWING_ERROR,
  FOLLOW_USER,
  UNFOLLOW_USER
} from '../constants/ActionTypes'

import _ from 'lodash'

const initialState = {
  accountId: null,
  error: undefined,
  items: []
}

export function friendship(state = initialState, action) {
  let { type, payload } = action

  switch (type) {
    case INIT_FRIENDSHIPS: {
      return {...state, accountId: payload.accountId}
    }
    case FOLLOW_USER: {
      const items = _.concat(state.items, payload.accountId)
      return {...state, items: items}
    }
    case UNFOLLOW_USER: {
      const items = _.without(state.items, payload.accountId)
      return {...state, items: items}
    }
    case FETCH_FOLLOWING: {
      return {...state}
    }
    case FETCH_FOLLOWING_ERROR: {
      return {...state, error: payload.error}
    }
    case FETCH_FOLLOWING_SUCCESS: {
      let items = state.items
      if(state.accountId == payload.accountId)
        items = payload.items.map(item => item.id)
      return {...state, items: items}
    }
  }

  return state
}
