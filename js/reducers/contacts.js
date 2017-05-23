import {
  FETCH_CONTACTS_TO_FOLLOW,
  FETCH_CONTACTS_TO_FOLLOW_SUCCESS,
  FETCH_CONTACTS_TO_FOLLOW_ERROR,
  FETCH_CONTACTS_TO_INVITE,
  FETCH_CONTACTS_TO_INVITE_SUCCESS,
  FETCH_CONTACTS_TO_INVITE_ERROR,
  LOAD_DEVICE_CONTACTS,
  LOAD_DEVICE_CONTACTS_SUCCESS,
  LOAD_DEVICE_CONTACTS_ERROR
} from '../constants/ActionTypes'

const initialState = {
  fetchingData: false,
  reloading: false,
  error: undefined,
  statusChanged: false,
  followItems: [],
  inviteItems: [],
  deviceContacts: []
}

export function contacts(state = initialState, action) {
  let { type, payload } = action

  switch (type) {
    case FETCH_CONTACTS_TO_FOLLOW: {
      let followItems = state.followItems
      return {...state, fetchingData: true, followItems: followItems}
    }
    case FETCH_CONTACTS_TO_FOLLOW_SUCCESS: {
      const followItems = payload.followItems.map(item => {
        item.following = false
        return item
      })
      return {...state, fetchingData: false, followItems: followItems}
    }
    case FETCH_CONTACTS_TO_FOLLOW_ERROR: {
      return {...state, fetchingData: false, error: payload.error}
    }
    case FETCH_CONTACTS_TO_INVITE: {
      let inviteItems = state.inviteItems
      return {...state, fetchingData: true, inviteItems: inviteItems}
    }
    case FETCH_CONTACTS_TO_INVITE_SUCCESS: {
      const inviteItems = payload.inviteItems.map(item => {
        item.following = false
        return item
      })
      return {...state, fetchingData: false, inviteItems: inviteItems}
    }
    case FETCH_CONTACTS_TO_INVITE_ERROR: {
      return {...state, fetchingData: false, error: payload.error}
    }
    case LOAD_DEVICE_CONTACTS: {
      let deviceContacts = state.deviceContacts
      return {...state, fetchingData: true, deviceContacts: deviceContacts}
    }
    case LOAD_DEVICE_CONTACTS_SUCCESS: {
      const deviceContacts = payload.deviceContacts.map(item => {
        item.following = false
        return item
      })
      return {...state, fetchingData: false, deviceContacts: deviceContacts}
    }
    case LOAD_DEVICE_CONTACTS_ERROR: {
      return {...state, fetchingData: false, error: payload.error}
    }
  }

  return state
}
