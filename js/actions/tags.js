import {doFetch} from './api'
import {
  FETCH_TAG_DATA_START,
  FETCH_TAG_DATA_SUCCESS,
  FETCH_TAG_DATA_ERROR,
  FETCH_HASHTAGS_START,
  FETCH_HASHTAGS_SUCCESS,
  FETCH_HASHTAGS_ERROR
} from '../constants/ActionTypes'

import { PAGE_SIZE } from '../constants/TagPage'

export function fetchTagData(tag, type, page = 0, reload = false) {
  return dispatch => {
    dispatch(startFetchingData(tag, type, page, reload))

    const action = type === 'hash' ? 'byHashTag' : 'byUsername'
    doFetch(`posts/${action}/${tag}`, {method: 'GET'}, {limit: PAGE_SIZE, page}).then(data => {
      dispatch(fetchDataSuccess(tag, type, page, data))
    }).catch(err => {
      dispatch(fetchDataError(tag, type, page, err))
    })
  }
}

function startFetchingData(tag, type, page, reloading) {
  return {
    type: FETCH_TAG_DATA_START,
    payload: {
      tag,
      type,
      page,
      reloading
    }
  }
}

function fetchDataSuccess(tag, type, page, data) {
  return {
    type: FETCH_TAG_DATA_SUCCESS,
    payload: {
      tag,
      type,
      page,
      items: data
    }
  }
}

function fetchDataError(tag, type, page, error) {
  return {
    type: FETCH_TAG_DATA_ERROR,
    payload: {
      tag,
      type,
      page,
      error
    }
  }
}

export function fetchHashtags(tag, page = 0) {
  return dispatch => {
    dispatch(startFetchingHashtags(tag, page))


    doFetch(`hashtags/getHashtagsLike/${tag}`, {method: 'GET'}, {limit: PAGE_SIZE, page}).then(data => {
      dispatch(fetchHashtagsSuccess(tag, page, data))
    }).catch(err => {
      dispatch(fetchHashtagsError(tag, page, err))
    })
  }
}

function startFetchingHashtags(tag, page) {
  return {
    type: FETCH_HASHTAGS_START,
    payload: {
      tag,
      page
    }
  }
}

function fetchHashtagsSuccess(tag, page, data) {
  return {
    type: FETCH_HASHTAGS_SUCCESS,
    payload: {
      tag,
      page,
      hashtags: data
    }
  }
}

function fetchHashtagsError(tag, page, error) {
  return {
    type: FETCH_HASHTAGS_ERROR,
    payload: {
      tag,
      page,
      error
    }
  }
}
