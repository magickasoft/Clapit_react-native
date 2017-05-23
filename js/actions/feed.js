import { doFetch } from './api'

import {
  FETCH_FEED_DATA,
  FETCH_FEED_DATA_SUCCESS,
  FETCH_FEED_DATA_ERROR,
  FEED_ITEM_UPDATE
} from '../constants/ActionTypes'

import { AsyncStorage, NativeModules } from 'react-native'
const { MixpanelManager } = NativeModules

export function fetchFeedData(page = 0, reload = false, hashtag='') {
  return dispatch => {
    dispatch(startFetchingData(reload))
    
      if(hashtag[0] === '#')
        hashtag = hashtag.substr(1)

      return doFetch('posts/best', {
        method: 'GET'
      }, { version: 2, limit: 25, page, hashtag }).then(data => {
        // console.log('fetch feed ', data)

        const keys = data.map(d => '@BestFeed:' + d.id)
        AsyncStorage.multiGet(keys)
          .then(seenPosts => {
            const delayDuration = 60000 * 30 //delay 30 mins
            const hideDuration = 60000 * 60 * 2 + delayDuration // hide for 2 hours
            let filteredData = data.filter((_, i) => {
              const [postId, time] = seenPosts[i]
              const ts = parseInt(time)
              return !(time && (Date.now() - ts) > delayDuration && (Date.now() - ts) < hideDuration)
            })
            // console.log('filtered data', filteredData, seenPosts)

            if (filteredData.length === 0) {
              //keep top 3 if everything has been seen, so we don't show empty best feed
              filteredData = data.slice(0, 3)
            }

            dispatch(fetchDataSuccess(filteredData, page, reload))
          })

      }).catch(err => {
        dispatch(fetchDataError(err))
      })
  }
}

export function reloadFeedData(hashtag) {
  return fetchFeedData(0, true, hashtag)
}

export function updateFeedItem(payload) {
  return {
    type: FEED_ITEM_UPDATE,
    payload
  }
}

function startFetchingData(reloading = false) {
  return {
    type: FETCH_FEED_DATA,
    payload: {
      reloading
    }
  }
}

function fetchDataSuccess(data, page, reload) {
  return {
    type: FETCH_FEED_DATA_SUCCESS,
    payload: {
      items: data,
      page,
      reload
    }
  }
}

function fetchDataError(error) {
  return {
    type: FETCH_FEED_DATA_ERROR,
    payload: {
      error
    }
  }
}
