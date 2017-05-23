import {
    FETCH_GALLERY_MEDIAS,
    FETCH_GALLERY_MEDIAS_SUCCESS,
    FETCH_GALLERY_MEDIAS_ERROR
} from '../constants/ActionTypes'

const initialState = {
    fetchingMedias: false,
    reloading: false,
    error: undefined,
    page: 0,
    medias: undefined
}

export function post(state = initialState, action) {
    let { type, payload } = action

    switch (type) {
        case FETCH_GALLERY_MEDIAS: {
            return {...state, fetchingMedias: true, reloading: payload.reloading}
        }
        case FETCH_GALLERY_MEDIAS_SUCCESS: {
            return {...state, fetchingMedias: false, medias: payload.medias}
        }
        case FETCH_GALLERY_MEDIAS_ERROR: {
            return {...state, fetchingMedias: false, error: payload.error}
        }
    }

    return state
}
