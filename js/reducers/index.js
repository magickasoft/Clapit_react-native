'use strict'

import { combineReducers } from 'redux'
import { autoRehydrated } from './persist'
import { clapitAccountData, facebookLoggingIn, loggingIn, apiError, clapitDeviceToken } from './clapit'
import { facebookAuthData } from './facebook'
import { twitterAuthData } from './twitter'
import { instagramAuthData } from './instagram'
import { emailAuthData, emailLoginError } from './emailAuth'
import { feed } from './feed'
import { profiles, recentPosts, popularPosts } from './profiles'
import { post } from './post'
import { reactions } from './reactions'
import { friends } from './friends'
import { notifications, newNotifications } from './notifications'
import { tags } from './tags'
import { network } from './network'
import { contacts } from './contacts'
import { claps } from './claps'
import { friendship } from './friendship'
import { settings } from './settings'
import { navigationState } from './navigation'
import { fileUpload } from './fileUpload'
import { preferences } from './preferences'

const rootReducer = combineReducers({
    autoRehydrated,
    loggingIn,
    clapitAccountData,
    clapitDeviceToken,
    facebookLoggingIn,
    apiError,
    facebookAuthData,
    twitterAuthData,
    instagramAuthData,
    emailAuthData,
    emailLoginError,
    feed,
    profiles,
    recentPosts,
    popularPosts,
    post,
    reactions,
    friends,
    notifications,
    newNotifications,
    tags,
    network,
    contacts,
    claps,
    friendship,
    settings,
    navigationState,
    fileUpload,
    preferences
})

export default rootReducer
