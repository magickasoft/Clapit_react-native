import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactionList from '../components/Feed/ReactionList'
import * as FeedItemActions from '../actions/feedItem'

function stateToProps(state) {
    let { reactions } = state

    return { reactions }
}

function dispatchToProps(dispatch) {
    let actions = _.extend({}, FeedItemActions )

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(ReactionList)
