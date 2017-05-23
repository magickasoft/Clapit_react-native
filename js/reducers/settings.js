import {
  FACEBOOK_LOGOUT,
  FACEBOOK_LOGOUT_ERROR,
  INSTAGRAM_LOGOUT,
  INSTAGRAM_LOGOUT_ERROR,
  TWITTER_LOGOUT,
  TWITTER_LOGOUT_ERROR,
  ASSIGN_FACEBOOK_AUTH_DATA,
  ASSIGN_TWITTER_AUTH_DATA,
  ASSIGN_INSTAGRAM_AUTH_DATA
} from '../constants/ActionTypes'

import {
  MENU_SECTION,
  MENU_LOGGED_ACCOUNT,
  MENU_LINKED_ACCOUNT,
  MENU_STANDARD
} from '../constants/MenuTypes'

import _ from 'lodash'

const initialState = {
  error: undefined,
  menuItems: [
    {label: '', type: MENU_SECTION},
    {label: 'Sign Out of Clapit', type: MENU_STANDARD, name: 'signout'},
    {label: 'LINKED ACCOUNTS', type: MENU_SECTION},
    {label: 'Facebook', type: MENU_LINKED_ACCOUNT, name: 'linked_facebook', icon: require('image!settingsFbIcon'), isActive: false},
    {label: 'Twitter', type: MENU_LINKED_ACCOUNT, name: 'linked_twitter', icon: require('image!settingsTwitterIcon'), isActive: false},
    {label: '', type: MENU_SECTION},
    {label: 'Edit Profile', type: MENU_STANDARD, name: 'edit_profile'},
    {label: '', type: MENU_SECTION},
    {label: 'Invite Facebook Friends', type: MENU_STANDARD, name: 'invite_facebook_friends'},
    {label: 'Feedback', type: MENU_STANDARD, name: 'feedback'},
    {label: '', type: MENU_SECTION},
    {label: 'Privacy Policy', type: MENU_STANDARD, name: 'privacy_policy'},
    {label: 'Terms of Use', type: MENU_STANDARD, name: 'terms_of_use'}
  ]
}

export function settings(state = initialState, action) {
  let { type, payload } = action

  switch (type) {
    case ASSIGN_FACEBOOK_AUTH_DATA: {
      let account = _.find(state.menuItems, {name:"linked_facebook"})
      account.isActive = (payload.userID ? true : false)
      return {...state, menuItems: state.menuItems}
    }
    case FACEBOOK_LOGOUT: {
      let account = _.find(state.menuItems, {name:"linked_facebook"})
      account.isActive = false
      return {...state, menuItems: state.menuItems}
    }
    case FACEBOOK_LOGOUT_ERROR: {
      let account = _.find(state.menuItems, {name:"linked_facebook"})
      account.isActive = ! account.isActive
      return {...state, menuItems: state.menuItems, error: payload.error}
    }
    case ASSIGN_INSTAGRAM_AUTH_DATA: {
      let account = _.find(state.menuItems, {name:"linked_instagram"})
      account.isActive = (payload.userID ? true : false)
      return {...state, menuItems: state.menuItems}
    }
    case INSTAGRAM_LOGOUT: {
      let account = _.find(state.menuItems, {name:"linked_instagram"})
      account.isActive = false
      return {...state, menuItems: state.menuItems}
    }
    case INSTAGRAM_LOGOUT_ERROR: {
      let account = _.find(state.menuItems, {name:"linked_instagram"})
      account.isActive = ! account.isActive
      return {...state, menuItems: state.menuItems, error: payload.error}
    }
    case ASSIGN_TWITTER_AUTH_DATA: {
      let account = _.find(state.menuItems, {name:"linked_twitter"})
      account.isActive = (payload.userID ? true : false)
      return {...state, menuItems: state.menuItems}
    }
    case TWITTER_LOGOUT: {
      let account = _.find(state.menuItems, {name:"linked_twitter"})
      account.isActive = false
      return {...state, menuItems: state.menuItems}
    }
    case TWITTER_LOGOUT_ERROR: {
      let account = _.find(state.menuItems, {name:"linked_twitter"})
      account.isActive = ! account.isActive
      return {...state, menuItems: state.menuItems, error: payload.error}
    }
  }

  return state
}
