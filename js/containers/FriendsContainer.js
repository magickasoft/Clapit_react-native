import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Friends from '../components/Friends'
import * as friendsActions from '../actions/friends'
import * as networkActions from '../actions/network'
import * as contactActions from '../actions/contacts'

function stateToProps(state) {

    let { friends, clapitAccountData, contacts } = state

    return { friends, clapitAccountData, contacts }
}

function dispatchToProps(dispatch) {

    let actions = Object.assign({}, friendsActions, networkActions, contactActions)

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(Friends)
