import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactionItem from '../components/Feed/ReactionItem'
import * as FeedItemActions from '../actions/feedItem'
import * as friendsActions from '../actions/friends'

function stateToProps(state) {
    let { reactions } = state

    return { reactions }
}

function dispatchToProps(dispatch) {
    let actions = _.extend({}, FeedItemActions, friendsActions )

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(ReactionItem)
