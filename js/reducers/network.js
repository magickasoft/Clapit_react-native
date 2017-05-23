import {
  FETCH_FOLLOWERS,
  FETCH_FOLLOWERS_SUCCESS,
  FETCH_FOLLOWERS_ERROR,
  FETCH_FOLLOWING,
  FETCH_FOLLOWING_SUCCESS,
  FETCH_FOLLOWING_ERROR,
  FETCH_CLAPS,
  FETCH_CLAPS_SUCCESS,
  FETCH_CLAPS_ERROR
} from '../constants/ActionTypes'

const initialState = {
  fetchingData: false,
  reloading: false,
  error: undefined,
  statusChanged: false,
  items: []
}

export function network(state = initialState, action) {
  let { type, payload } = action

  switch (type) {
    case FETCH_FOLLOWERS: {
      let items = state.items
      if(payload.page == 0) {
        items = []
      }
      return {...state, fetchingData: true, statusChanged: false, items: items, page: payload.page, reloading: payload.reloading}
    }
    case FETCH_FOLLOWERS_SUCCESS: {
      const items = payload.items.map(item => {
        item.following = (item.friendship == 1)
        return item
      })
      return {...state, fetchingData: false, items: items}
    }
    case FETCH_FOLLOWERS_ERROR: {
      return {...state, fetchingData: false, error: payload.error}
    }
    case FETCH_FOLLOWING: {
      let items = state.items
      if(payload.page == 0) {
        items = []
      }
      return {...state, fetchingData: true, statusChanged: false, items: items, page: payload.page, reloading: payload.reloading}
    }
    case FETCH_FOLLOWING_SUCCESS: {
      const items = payload.items.map(item => {
        item.following = (item.friendship == 1)
        return item
      })
      return {...state, fetchingData: false, items: items}
    }
    case FETCH_FOLLOWING_ERROR: {
      return {...state, fetchingData: false, error: payload.error}
    }
    case FETCH_CLAPS: {
      let items = state.items
      if(payload.page == 0) {
        items = []
      }
      return {...state, fetchingData: true, statusChanged: false, items: items, page: payload.page, reloading: payload.reloading}
    }
    case FETCH_CLAPS_SUCCESS: {
      const items = payload.items.map(item => {
        item.following = (item.friendship == 1)
        return item
      })
      return {...state, fetchingData: false, items: items}
    }
    case FETCH_CLAPS_ERROR: {
      return {...state, fetchingData: false, error: payload.error}
    }
  }

  return state
}
