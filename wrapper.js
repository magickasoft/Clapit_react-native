'use strict'
import React from 'react';
import { AppRegistry, NativeModules } from 'react-native'
import { applyMiddleware, createStore, compose } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
import { Provider } from 'react-redux'
import createLogger from 'redux-logger'
import thunk from 'redux-thunk'
import rootReducer from './js/reducers'
import App from './js/app'
import { assignIsProd } from './js/actions/api'

let { SharedStorageManager } = NativeModules

const wrapper = (props) => {
    const { production, debug } = props

    assignIsProd(production)

    let middlewareApplied

    if(debug) {
      const logger = createLogger()

      middlewareApplied = applyMiddleware(thunk, logger)
    } else {
      middlewareApplied = applyMiddleware(thunk)  // no logger
    }

    const store = createStore(rootReducer, {}, compose(
      autoRehydrate(),
      middlewareApplied
    ))
    persistStore(store, {
      storage: SharedStorageManager,
      whitelist: ['clapitAccountData', 'facebookAuthData', 'twitterAuthData', 'instagramAuthData', 'newNotifications', 'preferences']
    }).purge(['feed', 'notifications', 'network'])

    return (
        <Provider store={store}>
          <App debug={debug} />
        </Provider>
    )
}

export default wrapper
