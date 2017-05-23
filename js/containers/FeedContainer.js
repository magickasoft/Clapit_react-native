import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Feed from '../components/Feed'
import * as feedActions from '../actions/feed'
import {searchFriends} from '../actions/friends'


function stateToProps(state) {
    let { feed, clapitAccountData, friends, navigationState } = state
    let {items, itemsById, fetchingData, reloading, error, page} = feed
    return { items, itemsById, fetchingData, reloading, error, clapitAccountData, page, friends, navigationState}
}

function dispatchToProps(dispatch) {

    let actions = Object.assign({searchFriends}, feedActions)

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(Feed)
