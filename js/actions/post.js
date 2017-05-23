import {
    FETCH_GALLERY_MEDIAS,
    FETCH_GALLERY_MEDIAS_SUCCESS,
    FETCH_GALLERY_MEDIAS_ERROR
} from '../constants/ActionTypes'

import React, { Component } from 'react';
import  {
    CameraRoll
} from 'react-native'

export function fetchMedias(count, after, reload = false) {
    return (dispatch, getState) => {
        let { post: { fetchingMedias } } = getState()

        if(fetchingMedias) { return }  // already doing it

        dispatch(startFetchingMedias(reload))
        return CameraRoll.getPhotos({
          first: count,
          assetType: 'All',
          groupTypes: 'SavedPhotos',
          after
        }).then(data => {
            dispatch(fetchMediasSuccess(data))
        }).catch(err => {
            dispatch(fetchMediasError(err))
        })
    }
}

function startFetchingMedias(reloading = false) {
    return {
        type: FETCH_GALLERY_MEDIAS,
        payload: {
            reloading
        }
    }
}

function fetchMediasSuccess(data) {
    return {
        type: FETCH_GALLERY_MEDIAS_SUCCESS,
        payload: {
            medias: data
        }
    }
}

function fetchMediasError(error) {
    return {
        type: FETCH_GALLERY_MEDIAS_ERROR,
        payload: {
            error
        }
    }
}
