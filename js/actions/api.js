import _ from 'lodash'
import queryString from 'query-string'
import { NetInfo, NativeModules, Alert } from 'react-native'

let { RNUploader, KochavaWrapper, RNMixpanel:Mixpanel } = NativeModules

//export const STAGING_BASE_URL = 'https://staging-api.clapit.com'
// export const STAGING_BASE_URL = 'http://192.168.1.103:3000'
//export const STAGING_BASE_URL = 'https://api.clapit.com'
export const STAGING_BASE_URL = 'https://staging-api.clapit.com'
export const PROD_BASE_URL = 'https://staging-api.clapit.com'

const KOCHAVA_API_KEY = "48145449-5E93-41A6-8605-1574DC535080"
const KOCHAVA_APP_ID = "koclapit-2ait"

KochavaWrapper.initWithKochavaAppId(KOCHAVA_APP_ID);

let baseUrl
let accessToken = null

let queue = []

let isConnected = false

function handleFirstConnectivityChange(reach) {
    if (reach == 'none' || reach == 'unknown') {
        Alert.alert('Connection', 'The clapit app requires a Internet connection.  Please check your settings and try again.', { text: 'OK' })
        isConnected = false
    } else {
        isConnected = true
    }
    NetInfo.removeEventListener(
        'change',
        handleFirstConnectivityChange
    );
}

NetInfo.addEventListener('change', handleFirstConnectivityChange)


export function assignIsProd(isProd) {
    if (isProd) {
        baseUrl = PROD_BASE_URL
    } else {
        baseUrl = STAGING_BASE_URL
    }
}

export function assignAccessToken(token) {
    if (!token) {
        return;
    }
    accessToken = token
}

export function doFetch(endpoint, params = {}, query = {}) {
    if (!isConnected) {
        return Promise.reject('Not connected')
    }

    let headers = {
        'Content-Type': 'application/json'
    }

    if (accessToken) {
        headers = _.assign(headers, { 'Authorization': accessToken })
    }

    let fetchParams = _.assign({}, params, {
        headers
    })

    if (fetchParams.body) {
        fetchParams.body = JSON.stringify(fetchParams.body)
    }

    let url = `${baseUrl}/api/${endpoint}`
    if (!_.isEmpty(query)) {
        let qs = queryString.stringify(query)
        url = `${url}?${qs}`
    }
    // console.log('fetch', url, fetchParams)
    return fetch(url, fetchParams)
        .then(response => {
            let { status } = response

            if (status >= 400) {
                return { error: { status } }
            }
            return response.json()
        })
        .catch(err => err)
}

const CLOUD_NAME = 'dz4nkgvsp'
const UPLOAD_PRESET = 't1qa8lvv'

export function uploadToCloudinary(type, uri, callback) {
    if (type == 'image') {
        RNUploader.upload({
            url: "https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/image/upload",
            method: 'POST',
            params: {
                upload_preset: UPLOAD_PRESET
            },
            files: [
                {
                    name: 'file',
                    filename: 'image.jpg',
                    filepath: uri
                }
            ]
        }, callback);
    } else if (type == 'video') {
        RNUploader.upload({
            url: "https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/video/upload",
            method: 'POST',
            params: {
                upload_preset: UPLOAD_PRESET
            },
            files: [
                {
                    name: 'file',
                    filename: 'movie.mp4',
                    filepath: uri
                }
            ]
        }, callback);
    }
    else {
        throw Error(`Unrecognized type: ${type} for request: ${uri}`)
    }
}


export function createMedia(url) {
    return doFetch('Media', {
        method: 'POST',
        body: {
            originalURL: url,
            largeURL: url,  // for backwards compatibility
            mediumURL: url,
            smallURL: url
        }
    })
}

export function updatePost(id, data) {    
    KochavaWrapper.trackEvent("updatePost", JSON.stringify(data))
    return doFetch('Posts/' + id, {
        method: 'PUT',
        body: data
    })
}

export function createPost(data) {
    data = { title: '', ...data }
    KochavaWrapper.trackEvent("createPost", JSON.stringify(data))
    // if (Mixpanel){
    //     Mixpanel.track("Create Post");
    // }
    return doFetch('Posts/new', {
        method: 'POST',
        body: data
    })
}
