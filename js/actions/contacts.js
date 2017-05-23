import { doFetch } from './api'

import React, { Component } from 'react';
import  {
  NativeModules
} from 'react-native'

import {
    FETCH_CONTACTS_TO_FOLLOW,
    FETCH_CONTACTS_TO_FOLLOW_SUCCESS,
    FETCH_CONTACTS_TO_FOLLOW_ERROR,
    FETCH_CONTACTS_TO_INVITE,
    FETCH_CONTACTS_TO_INVITE_SUCCESS,
    FETCH_CONTACTS_TO_INVITE_ERROR,
    LOAD_DEVICE_CONTACTS,
    LOAD_DEVICE_CONTACTS_SUCCESS,
    LOAD_DEVICE_CONTACTS_ERROR,
    FETCH_INVITE_CONTACT ,
    FETCH_INVITE_CONTACT_SUCCESS ,
    FETCH_INVITE_CONTACT_ERROR,
    FETCH_SKIP_CONTACT ,
    FETCH_SKIP_CONTACT_SUCCESS,
    FETCH_SKIP_CONTACT_ERROR,
    FETCH_INVITE_ALL_CONTACTS ,
    FETCH_INVITE_ALL_CONTACTS_SUCCESS ,
    FETCH_INVITE_ALL_CONTACTS_ERROR,
} from '../constants/ActionTypes'

let { Contacts } = NativeModules

export function fetchContactsToFollow(contacts, currentUserId, callback) {
    return dispatch => {
        dispatch({ type: FETCH_CONTACTS_TO_FOLLOW, payload: { contacts, currentUserId } })
        //limit displayed contacts to max 100
        contacts = contacts.slice(0, 100)

        return doFetch(`accounts/${currentUserId}/contactsToFollow`, {
            method: 'POST',
            body: contacts
        }).then(data => {
            dispatch(fetchContactsToFollowSuccess( currentUserId, data))
            if (callback) callback(data)
        }).catch(err => {
            dispatch(fetchContactsToFollowError(currentUserId, err))
            if (callback) callback(err)
        })
    }
}

export function fetchInviteContact(id, callback) {
    return dispatch => {
        dispatch({ type: FETCH_INVITE_CONTACT, payload: {} })
        return doFetch(`accountcontacts/invite/${id}`, {
            method: 'GET'
        }).then(data => {
            dispatch({
                type: FETCH_INVITE_CONTACT_SUCCESS,
                payload: {}
            })
            if (callback) callback(data)
        }).catch(error => {
            dispatch({
                type: FETCH_INVITE_CONTACT_ERROR,
                payload: {error}
            })
            if (callback) callback(error)
        })
    }
}

export function fetchInviteAllContacts(id, callback) {
    return dispatch => {
        dispatch({ type: FETCH_INVITE_ALL_CONTACTS, payload: {} })
        return doFetch(`accountcontacts/${id}/inviteAll`, {
            method: 'GET'
        }).then(data => {
            dispatch({
                type: FETCH_INVITE_ALL_CONTACTS_SUCCESS,
                payload: {}
            })
            if (callback) callback(data)
        }).catch(error => {
            dispatch({
                type: FETCH_INVITE_ALL_CONTACTS_ERROR,
                payload: {error}
            })
            if (callback) callback(error)
        })
    }
}

export function fetchSkipContact(id, callback) {
    return dispatch => {
        dispatch({ type: FETCH_SKIP_CONTACT, payload: {} })
        return doFetch(`accountcontacts/skip/${id}`, {
            method: 'GET'
        }).then(data => {
            dispatch({
                type: FETCH_SKIP_CONTACT_SUCCESS,
                payload: {}
            })
            if (callback) callback(data)
        }).catch(error => {
            dispatch({
                type: FETCH_SKIP_CONTACT_ERROR,
                payload: {error}
            })
            if (callback) callback(error)
        })
    }
}


function fetchContactsToFollowSuccess(id, data) {
    return {
        type: FETCH_CONTACTS_TO_FOLLOW_SUCCESS,
        payload: {
            followItems: data,
            accountId: id
        }
    }
}


function fetchContactsToFollowError(id, error) {
    return {
        type: FETCH_CONTACTS_TO_FOLLOW_ERROR,
        payload: {
            error,
            accountId: id
        }
    }
}

export function fetchContactsToInvite(contacts, currentUserId, callback) {
    return dispatch => {
        dispatch({ type: FETCH_CONTACTS_TO_INVITE, payload: { contacts, currentUserId } })
        return doFetch(`accounts/${currentUserId}/contactsToInvite`, {
            method: 'POST',
            body: contacts
        }).then(data => {
            if (data.error) {
                dispatch(fetchContactsToInviteError(currentUserId, error))
                if (callback) callback(error)
                return
            }
            dispatch(fetchContactsToInviteSuccess(currentUserId, data))
            if (callback) callback(data)
        }).catch(err => {
            dispatch(fetchContactsToInviteError(currentUserId, err))
            if (callback) callback(err)
        })
    }
}

function fetchContactsToInviteSuccess(id, data) {
    return {
        type: FETCH_CONTACTS_TO_INVITE_SUCCESS,
        payload: {
            inviteItems: data,
            accountId: id
        }
    }
}


function fetchContactsToInviteError(id, error) {
    return {
        type: FETCH_CONTACTS_TO_INVITE_ERROR,
        payload: {
            error,
            accountId: id
        }
    }
}

export function loadDeviceContacts(callback) {
    return dispatch => {
        dispatch({ type: LOAD_DEVICE_CONTACTS, payload: {} })
        Contacts.getAll((err, contacts) => {
            if (err) {
                dispatch(loadDeviceContactsError(err))
                if (callback) callback(err)
            } else {
                dispatch(loadDeviceContactsSuccess(contacts))
                if (callback) callback(null, contacts)
            }
        })
    }
}

function loadDeviceContactsSuccess(data) {
    return {
        type: LOAD_DEVICE_CONTACTS_SUCCESS,
        payload: {
            deviceContacts: data
        }
    }
}


function loadDeviceContactsError(error) {
    return {
        type: LOAD_DEVICE_CONTACTS_ERROR,
        payload: {
            error
        }
    }
}
