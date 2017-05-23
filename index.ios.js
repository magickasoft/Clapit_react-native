'use strict'
import React from 'react';
import {
    AppRegistry
} from 'react-native'
import wrapper from './wrapper'
import extension from './extension'

AppRegistry.registerComponent('Clapit', () => wrapper)
AppRegistry.registerComponent('ClapitExtension', () => extension)
