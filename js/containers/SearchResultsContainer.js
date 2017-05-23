import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import SearchResults from '../components/SearchResults'
import * as friendsActions from '../actions/friends'
import * as networkActions from '../actions/network'

function stateToProps(state) {

    let { friends, clapitAccountData } = state

    return { friends, clapitAccountData }
}

function dispatchToProps(dispatch) {

    let actions = Object.assign({}, friendsActions, networkActions)

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(SearchResults)
