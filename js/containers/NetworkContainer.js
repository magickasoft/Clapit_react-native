import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Network from '../components/Network'
import * as networkActions from '../actions/network'
import {searchFriends} from '../actions/friends'
import {fetchContactsToFollow, fetchContactsToInvite, loadDeviceContacts} from '../actions/contacts'

function stateToProps(state) {
    let { network, clapitAccountData, contacts } = state

    return { network, clapitAccountData, contacts }
}

function dispatchToProps(dispatch) {
    let actions = _.extend({}, networkActions, {fetchContactsToFollow, fetchContactsToInvite, loadDeviceContacts, searchFriends})

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(Network)
