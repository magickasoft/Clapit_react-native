'use strict'

import React from 'react';
import { NativeModules } from 'react-native'
import { applyMiddleware, createStore, compose } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
import { Provider } from 'react-redux'
import createLogger from 'redux-logger'
import thunk from 'redux-thunk'
import rootReducer from './js/reducers'
import Extension from './js/extension'
import { assignIsProd } from './js/actions/api'

const { SharedStorageManager } = NativeModules
// const { RNMixpanel:Mixpanel } = NativeModules

//todo Mixpanel currently doesn't work with extension - requires xcode library import

// const MIXPANEL_TOKEN = process.env.NODE_ENV === 'dev' ? "23e6d9f0bf35e1f4308927110dbfc498" : "a6052cd4d26b0d8b8ccc0609efe815d2";

// Mixpanel.sharedInstanceWithToken(MIXPANEL_TOKEN);
// Mixpanel.track("Share Extension Started");

// console.log('init mix', Mixpanel)

class extension extends React.Component {

  constructor(props) {
    super(props)
    const { production } = props
    assignIsProd(production)
  }
  
  render() {

    const { debug } = this.props

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
      whitelist: ['clapitAccountData', 'facebookAuthData', 'twitterAuthData', 'instagramAuthData']
    }).purge(['feed'])

    return (
        <Provider store={store}>
          <Extension {...this.props} />
        </Provider>
    )
  }
}

export default extension
