import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PostDetails from '../components/PostDetails'
import * as networkActions from '../actions/network'
import * as feedItemActions from '../actions/feedItem'
import * as friendsActions from '../actions/friends'

function stateToProps(state) {
    let { reactions, friendship, tags, navigationState } = state

    return { reactions, friendship, tags, navigationState }
}

function dispatchToProps(dispatch) {
    let actions = _.extend({}, feedItemActions, networkActions, friendsActions )

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(PostDetails)
